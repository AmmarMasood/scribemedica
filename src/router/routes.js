const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/",
        component: () => import("pages/LandingPage.vue"),
        beforeEnter: (to, from, next) => {
          // Check if localStorage.auth exists
          if (localStorage.getItem("auth")) {
            // If it exists, redirect to home or other authorized page
            if (localStorage.getItem("role") === "ADMIN") {
              next("/admin");
            } else {
              next("/new");
            }
          } else {
            // If it doesn't exist, allow the navigation to the auth routes
            next();
          }
        },
        children: [
          {
            path: "",
            component: () => import("pages/auth/LoginSection.vue"),
          },
          {
            path: "register",
            component: () => import("pages/auth/RegisterSection.vue"),
          },
          {
            path: "forgot-password",
            component: () => import("pages/auth/ForgotPasswordSection.vue"),
          },
        ],
      },
      // {
      //   path: "/privacy-policy",
      //   component: () => import("pages/PrivacyPolicy.vue"),
      //   children: [
      //     {
      //       path: "",
      //       component: () => import("../pages/privacy/PrivacyPolicy.vue"),
      //     },
      //   ],
      // },
      {
        path: "/auth",
        component: () => import("pages/AuthPage.vue"),
        beforeEnter: (to, from, next) => {
          // Check if localStorage.auth exists
          if (localStorage.getItem("auth")) {
            // If it exists, redirect to home or other authorized page
            next("/new");
          } else {
            // If it doesn't exist, allow the navigation to the auth routes
            next();
          }
        },
        children: [
          {
            path: "",
            component: () => import("pages/auth/LoginSection.vue"),
          },
          {
            path: "admin",
            component: () => import("pages/auth/AdminLogin.vue"),
          },
          {
            path: "register",
            component: () => import("pages/auth/RegisterSection.vue"),
          },
          {
            path: "forgot-password",
            component: () => import("pages/auth/ForgotPasswordSection.vue"),
          },
        ],
      },
      {
        path: "/new",
        component: () => import("pages/NewRecordingPage.vue"),
        beforeEnter: (to, from, next) => {
          // Check if localStorage.auth exists
          if (!localStorage.getItem("auth")) {
            // If it exists, redirect to home or other authorized page
            next("/auth");
          } else {
            // If it doesn't exist, allow the navigation to the auth routes
            next();
          }
        },

        children: [
          {
            path: "",
            component: () => import("pages/newRecording/StartRecording.vue"),
          },
          {
            path: ":patientType/:patientId",
            component: () => import("pages/newRecording/RecordingSession.vue"),
          },
        ],
      },
      {
        path: "/recordings",
        component: () => import("pages/RecordingListPage.vue"),
        beforeEnter: (to, from, next) => {
          // Check if localStorage.auth exists
          if (!localStorage.getItem("auth")) {
            // If it exists, redirect to home or other authorized page
            next("/auth");
          } else {
            // If it doesn't exist, allow the navigation to the auth routes
            next();
          }
        },

        children: [
          {
            path: "",
            component: () => import("pages/recordings/RecordingList.vue"),
          },
          {
            path: "details/:noteId",
            component: () => import("pages/recordings/NoteDetail.vue"),
          },
        ],
      },
      {
        path: "/account",
        component: () => import("pages/AccountPage.vue"),
        beforeEnter: (to, from, next) => {
          // Check if localStorage.auth exists
          if (!localStorage.getItem("auth")) {
            // If it exists, redirect to home or other authorized page
            next("/auth");
          } else {
            // If it doesn't exist, allow the navigation to the auth routes
            next();
          }
        },
        children: [
          {
            path: "",
            component: () => import("pages/account/AccountSettings.vue"),
          },
        ],
      },
      {
        path: "/admin",
        component: () => import("pages/AuthPage.vue"),
        beforeEnter: (to, from, next) => {
          // Check if localStorage.auth exists
          if (
            localStorage.getItem("auth") &&
            localStorage.getItem("role") === "ADMIN"
          ) {
            // If it exists, redirect to home or other authorized page
            next();
          } else {
            // If it doesn't exist, allow the navigation to the auth routes
            next("/new");
          }
        },
        children: [
          {
            path: "",
            component: () => import("../pages/admin/RecordingList.vue"),
          },
          {
            path: "/details/:noteId",
            component: () => import("../pages/admin/NotesDetail.vue"),
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
