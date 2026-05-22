export const API_ENDPOINTS = {
  auth: {
    login: 'auth/login',
    signup: 'auth/register',
  },
  locations: {
    list: 'locations',
    update: (id: string) => `locations/${id}`,
    create: 'locations',
  },
  simulators: {
    list: 'simulators',
    create: 'simulators',
    update: (id: string) => `simulators/${id}`,
  },
  admin: {
    members: 'admin/members',
  },
  booking: {
    slots: 'reservations/slots',
    myBooking: 'reservations/my',
    allBookings: 'reservations',
    cancel: "reservations"
  },
  courses: {
    list: "courses",
    create: "courses",
    update: "courses",
    delete: "courses"
  }
} as const;
