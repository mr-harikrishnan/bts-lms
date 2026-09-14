import { Notification } from '../models/Notification.js';
import { toObjectId } from '../utils/objectId.js';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function createCourseNotification(courseId: string, courseTitle: string) {
  try {
    const notification = await Notification.create({
      userId: null, // Broadcast to all learners
      title: 'New Course Available!',
      message: `"${courseTitle}" has just been published to the catalog. Explore curriculum and enroll today.`,
      type: 'course_new',
      courseId: toObjectId(courseId),
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create course notification:', error);
    return null;
  }
}

export async function createTicketNotification(
  userId: string,
  ticketId: string,
  subject: string,
  adminMessage: string
) {
  try {
    const userOid = toObjectId(userId);
    const notification = await Notification.create({
      userId: userOid,
      title: `Support Ticket Update: ${ticketId}`,
      message: `Admin replied: "${adminMessage.slice(0, 100)}${adminMessage.length > 100 ? '...' : ''}" on subject "${subject}".`,
      type: 'ticket_reply',
      ticketId,
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create ticket notification:', error);
    return null;
  }
}

export async function getUserNotifications(userId: string) {
  const userOid = toObjectId(userId);
  if (!userOid) return [];

  const now = Date.now();
  const expiryCutoff = new Date(now - TWENTY_FOUR_HOURS_MS);

  // Auto-purge personal notifications read over 24 hours ago
  try {
    await Notification.deleteMany({
      userId: userOid,
      isRead: true,
      readAt: { $ne: null, $lt: expiryCutoff },
    });
  } catch (err) {
    console.error('[NotificationService] Auto-purge error:', err);
  }

  // Fetch all potential notifications (personal or broadcast), excluding those user has deleted
  const notifications = await Notification.find({
    $and: [
      { $or: [{ userId: userOid }, { userId: null }] },
      { deletedBy: { $ne: userOid } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(40)
    .populate('courseId', 'title category thumbnail price')
    .lean();

  const results: any[] = [];

  for (const n of notifications) {
    if (n.userId) {
      // Personal notification: skip if read > 24 hours ago
      if (n.isRead && n.readAt && new Date(n.readAt).getTime() < now - TWENTY_FOUR_HOURS_MS) {
        continue;
      }
      results.push({
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        courseId: n.courseId,
        ticketId: n.ticketId,
        isRead: n.isRead,
        readAt: n.readAt,
        createdAt: n.createdAt,
      });
    } else {
      // Broadcast notification
      const readEntry = n.readBy?.find((item: any) => {
        const entryUserId = item.userId ? item.userId.toString() : item.toString();
        return entryUserId === userId;
      });

      // If user read this broadcast notification over 24h ago, auto-expire for this user
      if (readEntry && readEntry.readAt && new Date(readEntry.readAt).getTime() < now - TWENTY_FOUR_HOURS_MS) {
        continue;
      }

      results.push({
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        courseId: n.courseId,
        ticketId: n.ticketId,
        isRead: !!readEntry,
        readAt: readEntry?.readAt || null,
        createdAt: n.createdAt,
      });
    }
  }

  return results;
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const notifOid = toObjectId(notificationId);
  const userOid = toObjectId(userId);
  if (!notifOid || !userOid) return null;

  const notification = await Notification.findById(notifOid);
  if (!notification) return null;

  const now = new Date();

  if (notification.userId) {
    notification.isRead = true;
    notification.readAt = now;
  } else {
    // Broadcast notification
    if (!notification.readBy) notification.readBy = [];
    const exists = notification.readBy.some((entry: any) => {
      const entryId = entry.userId ? entry.userId.toString() : entry.toString();
      return entryId === userId;
    });

    if (!exists) {
      notification.readBy.push({
        userId: userOid,
        readAt: now,
      });
    }
  }

  await notification.save();
  return { success: true };
}

export async function markAllNotificationsAsRead(userId: string) {
  const userOid = toObjectId(userId);
  if (!userOid) return { success: false };

  const now = new Date();

  // Mark personal notifications
  await Notification.updateMany(
    { userId: userOid, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );

  // For broadcast notifications where user hasn't read yet
  const broadcasts = await Notification.find({
    userId: null,
    'readBy.userId': { $ne: userOid },
  });

  for (const b of broadcasts) {
    b.readBy.push({ userId: userOid, readAt: now });
    await b.save();
  }

  return { success: true };
}

export async function deleteNotification(notificationId: string, userId: string) {
  const notifOid = toObjectId(notificationId);
  const userOid = toObjectId(userId);
  if (!notifOid || !userOid) {
    const error: any = new Error('Invalid notification or user ID.');
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findById(notifOid);
  if (!notification) {
    const error: any = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  if (notification.userId) {
    if (notification.userId.toString() !== userId) {
      const error: any = new Error('Forbidden: Cannot delete another user\'s notification.');
      error.statusCode = 403;
      throw error;
    }
    await Notification.deleteOne({ _id: notifOid });
  } else {
    // Broadcast notification: add user to deletedBy array
    if (!notification.deletedBy) notification.deletedBy = [];
    if (!notification.deletedBy.some((id) => id.toString() === userId)) {
      notification.deletedBy.push(userOid);
      await notification.save();
    }
  }

  return { success: true, message: 'Notification cleared successfully.' };
}
