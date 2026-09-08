import { User } from "@/types";
import { readJsonFile, writeJsonFile } from "./storage";

export async function getUserById(id: string): Promise<User | null> {
  if (!id) {
    return null;
  }

  const users = await readJsonFile<User[]>("users.json");
  const found = users.find((u) => u.id === id);
  return found ? sanitizeUser(found) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) {
    return null;
  }

  const users = await readJsonFile<User[]>("users.json");
  const found = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  return found ? sanitizeUser(found) : null;
}

export async function authenticateUser(
  email: string,
  password?: string
): Promise<User | null> {
  if (!email) {
    return null;
  }

  const users = await readJsonFile<User[]>("users.json");
  const found = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!found) {
    return null;
  }

  // If password provided and stored, verify (mock authentication check)
  if (password && found.password && found.password !== password) {
    return null;
  }

  return sanitizeUser(found);
}

export async function createUser(data: Partial<User>): Promise<User> {
  if (!data.email || !data.name) {
    throw new Error("Name and email are required for account creation.");
  }

  const users = await readJsonFile<User[]>("users.json");
  const existing = users.find(
    (u) => u.email.toLowerCase() === data.email!.trim().toLowerCase()
  );

  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    college: data.college?.trim() || "University Partner Institution",
    district: data.district?.trim() || "Coimbatore",
    state: data.state?.trim() || "Tamil Nadu",
    rollNumber: data.rollNumber?.trim() || `BST-${Math.floor(1000 + Math.random() * 9000)}`,
    grantName: data.grantName?.trim() || "Academic Talent Grant",
    avatar:
      data.avatar ||
      "https://lh3.googleusercontent.com/aida/AEtjO1U9TCa559VGVPXEorXaOd4-4F3-_yxTRkDiN4yL_rHscfc61Dv4oR6rF-Q5Q4SMHc2OiVKW4ppUavOEPI0k5rbfijrF1pDp1QYAUDcOnaN9BVLxBtRq47v7eMcqWE7eGAv5AK-_2-vhabqlwssRcL7ZzhHYRFQg21fjuWJbAUwIiCuxxGKHOITP3QvhqfDi6cdJfeH5tDbP6RoKeD5zNznQitsO7Rh6xF-n0IR0V8a4IS3RYSu34w6dLQQ",
    isLoggedIn: true,
    password: data.password || "password123",
  };

  users.push(newUser);
  await writeJsonFile<User[]>("users.json", users);

  return sanitizeUser(newUser);
}

export async function updateUser(
  email: string,
  updates: Partial<User>
): Promise<User | null> {
  if (!email) {
    return null;
  }

  const users = await readJsonFile<User[]>("users.json");
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (index === -1) {
    return null;
  }

  const updatedUser: User = {
    ...users[index],
    ...updates,
    email: users[index].email, // Preserve immutable primary email identifier
  };

  users[index] = updatedUser;
  await writeJsonFile<User[]>("users.json", users);

  return sanitizeUser(updatedUser);
}

function sanitizeUser(user: User): User {
  const copy = { ...user };
  delete copy.password;
  return copy;
}
