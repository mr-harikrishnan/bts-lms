src/data/
├── courses/
│   ├── performance-marketing/
│   │   ├── course.json                    # Course metadata, instructors, pricing, overview
│   │   ├── assessment.json                # Certification test & quiz questions
│   │   └── modules/
│   │       ├── module-01/
│   │       │   ├── module.json            # Module 01 metadata & lessons index
│   │       │   └── lessons/
│   │       │       ├── pm-1-1.json        # Lesson 1.1: Foundations of Paid Acquisition
│   │       │       └── pm-1-2.json        # Lesson 1.2: Meta Ads Manager Setup
│   │       ├── module-02/
│   │       │   ├── module.json
│   │       │   └── lessons/
│   │       │       ├── pm-2-1.json
│   │       │       └── pm-2-2.json
│   │       ├── module-03/
│   │       └── module-04/
│   │
│   ├── full-stack-web-dev/
│   │   ├── course.json
│   │   ├── assessment.json
│   │   └── modules/
│   │       ├── module-01/
│   │       │   ├── module.json
│   │       │   └── lessons/
│   │       │       ├── lesson-1-1.json
│   │       │       ├── lesson-1-2.json
│   │       │       └── lesson-1-3.json
│   │       ├── module-02/
│   │       ├── module-03/
│   │       └── module-04/
│   │
│   ├── commercial-video-production/
│   │   ├── course.json
│   │   ├── assessment.json
│   │   └── modules/
│   │       ├── module-01/
│   │       └── module-02/
│   │
│   ├── backend-architecture-go/
│   ├── creative-direction-brand/
│   └── data-engineering-python/
│
├── users/
│   └── default-user.json                  # Default learner profile & institution details
├── enrollments/
│   └── default-enrollments.json           # Enrolled courses, active lessons & progress tracking
└── certificates/
    └── default-certificates.json          # Student credentials & verification keys
