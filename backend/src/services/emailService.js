const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendBookingEmail = async ({ to, reservation, date }) => {
  const startTime = new Date(reservation.startTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(reservation.endTime).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const msg = {
    to,
    from: "noreply@theadmiraltyclub.com",
    subject: "Your Booking is Confirmed ⛳ Admiralty Golf Club",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Georgia',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#0d1526 0%,#111d35 100%);border-radius:16px 16px 0 0;padding:40px 32px 32px;border:1px solid #1e2d4a;border-bottom:none;">
              <a href="https://theadmiraltyclub.com" style="display:inline-block;text-decoration:none;margin-bottom:16px;">
                <img src="https://theadmiraltyclub.com/logo.png" alt="The Admiralty Club" width="80" style="display:block;margin:0 auto;" />
              </a>
              <h1 style="margin:0;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;">
                <a href="https://theadmiraltyclub.com" style="color:#c9a84c;text-decoration:none;">Admiralty Golf Club</a>
              </h1>
              <div style="width:48px;height:1px;background:linear-gradient(to right,transparent,#c9a84c,transparent);margin:16px auto;"></div>
              <h2 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                Booking Confirmed
              </h2>
              <p style="margin:10px 0 0;font-size:15px;color:#94a3b8;font-family:Arial,sans-serif;">
                Your simulator session is all set. See you on the course!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#0d1526;border:1px solid #1e2d4a;border-top:none;border-bottom:none;padding:32px;">

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;border-radius:12px;border:1px solid #1e2d4a;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #1e2d4a;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;font-family:Arial,sans-serif;font-weight:600;">
                      Booking Details
                    </p>
                  </td>
                </tr>

                <!-- Location -->
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #1a2540;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:middle;">
                          <div style="width:32px;height:32px;background:#111d35;border-radius:8px;border:1px solid #1e2d4a;text-align:center;line-height:32px;font-size:14px;">📍</div>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <p style="margin:0;font-size:11px;color:#64748b;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Location</p>
                          <p style="margin:2px 0 0;font-size:15px;color:#ffffff;font-family:Arial,sans-serif;font-weight:600;">${reservation.simulator.location.name}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Date & Time -->
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #1a2540;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:middle;">
                          <div style="width:32px;height:32px;background:#111d35;border-radius:8px;border:1px solid #1e2d4a;text-align:center;line-height:32px;font-size:14px;">📅</div>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <p style="margin:0;font-size:11px;color:#64748b;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Date & Time</p>
                          <p style="margin:2px 0 0;font-size:15px;color:#ffffff;font-family:Arial,sans-serif;font-weight:600;">${startTime} – ${endTime}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Door Code -->
                <tr>
                  <td style="padding:16px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:middle;">
                          <div style="width:32px;height:32px;background:#111d35;border-radius:8px;border:1px solid #1e2d4a;text-align:center;line-height:32px;font-size:14px;">🔑</div>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <p style="margin:0;font-size:11px;color:#64748b;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Door Code</p>
                          <p style="margin:2px 0 0;font-size:15px;color:#ffffff;font-family:Arial,sans-serif;font-weight:600;">${reservation.doorCode}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Door Code Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#1a1500,#2a1f00);border:1px solid #c9a84c;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;font-family:Arial,sans-serif;">Your Access Code</p>
                    <p style="margin:0;font-size:36px;font-weight:700;color:#c9a84c;letter-spacing:8px;font-family:'Courier New',monospace;">${reservation.doorCode}</p>
                    <p style="margin:8px 0 0;font-size:12px;color:#92804a;font-family:Arial,sans-serif;">Use this code to access your simulator</p>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#111d35;border-radius:10px;border:1px solid #1e2d4a;padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;line-height:1.6;">
                      💡 <strong style="color:#cbd5e1;">Reminder:</strong> Please arrive a few minutes early to get settled in. If you need to cancel or reschedule, please do so at least 24 hours in advance.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#080d1a;border:1px solid #1e2d4a;border-top:none;border-radius:0 0 16px 16px;padding:28px 32px;">
              <div style="width:32px;height:1px;background:#c9a84c;margin:0 auto 16px;"></div>
              <p style="margin:0;font-size:13px;color:#c9a84c;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">
                <a href="https://theadmiraltyclub.com" style="color:#c9a84c;text-decoration:none;">Admiralty Golf Club</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#475569;font-family:Arial,sans-serif;">
                Enjoy your game. See you on the course.
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#334155;font-family:Arial,sans-serif;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Booking email sent to:", to);
  } catch (error) {
    console.error(
      "SendGrid error:",
      JSON.stringify(error.response?.body ?? error.message, null, 2),
    );
  }
};

const sendGuestCredentialsEmail = async ({
  to,
  name,
  email,
  password,
  accessDate,
}) => {
  const formattedDate = new Date(accessDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const msg = {
    to,
    from: "noreply@theadmiraltyclub.com",
    subject: "Your Day Pass — Admiralty Golf Club Login Details",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Day Pass Credentials</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <tr>
            <td align="center" style="background:linear-gradient(135deg,#0d1526 0%,#111d35 100%);border-radius:16px 16px 0 0;padding:40px 32px 32px;border:1px solid #1e2d4a;border-bottom:none;">
              <a href="https://theadmiraltyclub.com" style="display:inline-block;text-decoration:none;margin-bottom:16px;">
                <img src="https://theadmiraltyclub.com/logo.png" alt="The Admiralty Club" width="80" style="display:block;margin:0 auto;" />
              </a>
              <h1 style="margin:0;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;">Admiralty Golf Club</h1>
              <div style="width:48px;height:1px;background:linear-gradient(to right,transparent,#c9a84c,transparent);margin:16px auto;"></div>
              <h2 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Your Day Pass is Ready</h2>
              <p style="margin:10px 0 0;font-size:15px;color:#94a3b8;font-family:Arial,sans-serif;">
                Hi ${name}, a member has granted you a day pass. Use the credentials below to log in.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#0d1526;border:1px solid #1e2d4a;border-top:none;border-bottom:none;padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;border-radius:12px;border:1px solid #1e2d4a;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #1e2d4a;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;font-family:Arial,sans-serif;font-weight:600;">Login Credentials</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #1a2540;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="width:36px;vertical-align:middle;"><div style="width:32px;height:32px;background:#111d35;border-radius:8px;border:1px solid #1e2d4a;text-align:center;line-height:32px;font-size:14px;">✉️</div></td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;font-size:11px;color:#64748b;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Email</p>
                        <p style="margin:2px 0 0;font-size:15px;color:#ffffff;font-family:Arial,sans-serif;font-weight:600;">${email}</p>
                      </td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;border-bottom:1px solid #1a2540;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="width:36px;vertical-align:middle;"><div style="width:32px;height:32px;background:#111d35;border-radius:8px;border:1px solid #1e2d4a;text-align:center;line-height:32px;font-size:14px;">🔒</div></td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;font-size:11px;color:#64748b;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Password</p>
                        <p style="margin:2px 0 0;font-size:15px;color:#ffffff;font-family:'Courier New',monospace;font-weight:600;letter-spacing:2px;">${password}</p>
                      </td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td style="width:36px;vertical-align:middle;"><div style="width:32px;height:32px;background:#111d35;border-radius:8px;border:1px solid #1e2d4a;text-align:center;line-height:32px;font-size:14px;">📅</div></td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;font-size:11px;color:#64748b;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Valid On</p>
                        <p style="margin:2px 0 0;font-size:15px;color:#ffffff;font-family:Arial,sans-serif;font-weight:600;">${formattedDate} only</p>
                      </td>
                    </tr></table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a1500,#2a1f00);border:1px solid #c9a84c;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0;font-size:13px;color:#c9a84c;font-family:Arial,sans-serif;line-height:1.6;">
                      &#9888;&#65039; <strong>Important:</strong> Your access is valid on <strong>${formattedDate}</strong> only. Login attempts outside this date will be declined.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="background:#080d1a;border:1px solid #1e2d4a;border-top:none;border-radius:0 0 16px 16px;padding:28px 32px;">
              <div style="width:32px;height:1px;background:#c9a84c;margin:0 auto 16px;"></div>
              <p style="margin:0;font-size:13px;color:#c9a84c;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Admiralty Golf Club</p>
              <p style="margin:8px 0 0;font-size:12px;color:#475569;font-family:Arial,sans-serif;">Enjoy your game. See you on the course.</p>
              <p style="margin:16px 0 0;font-size:11px;color:#334155;font-family:Arial,sans-serif;">This is an automated message. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
  };

  try {
    await sgMail.send(msg);
    console.log("Guest credentials email sent to:", to);
  } catch (error) {
    console.error(
      "SendGrid error:",
      JSON.stringify(error.response?.body ?? error.message, null, 2),
    );
    throw error;
  }
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const msg = {
    to,
    from: "noreply@theadmiraltyclub.com",
    subject: "Reset Your Password — Admiralty Golf Club",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <tr>
            <td align="center" style="background:linear-gradient(135deg,#0d1526 0%,#111d35 100%);border-radius:16px 16px 0 0;padding:40px 32px 32px;border:1px solid #1e2d4a;border-bottom:none;">
              <a href="https://theadmiraltyclub.com" style="display:inline-block;text-decoration:none;margin-bottom:16px;">
                <img src="https://theadmiraltyclub.com/logo.png" alt="The Admiralty Club" width="80" style="display:block;margin:0 auto;" />
              </a>
              <h1 style="margin:0;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;">Admiralty Golf Club</h1>
              <div style="width:48px;height:1px;background:linear-gradient(to right,transparent,#c9a84c,transparent);margin:16px auto;"></div>
              <h2 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Password Reset</h2>
              <p style="margin:10px 0 0;font-size:15px;color:#94a3b8;font-family:Arial,sans-serif;">
                Hi ${name}, we received a request to reset your password.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#0d1526;border:1px solid #1e2d4a;border-top:none;border-bottom:none;padding:32px;">
              <p style="margin:0 0 24px;font-size:15px;color:#cbd5e1;font-family:Arial,sans-serif;line-height:1.6;">
                Click the button below to set a new password. This link expires in <strong style="color:#c9a84c;">1 hour</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#c9a84c;color:#0a0f1e;font-family:Arial,sans-serif;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="background:#111d35;border-radius:10px;border:1px solid #1e2d4a;padding:16px 20px;">
                    <p style="margin:0;font-size:12px;color:#64748b;font-family:Arial,sans-serif;line-height:1.6;">
                      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:12px;color:#475569;font-family:Arial,sans-serif;word-break:break-all;">
                Or copy this link: <a href="${resetUrl}" style="color:#c9a84c;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="background:#080d1a;border:1px solid #1e2d4a;border-top:none;border-radius:0 0 16px 16px;padding:28px 32px;">
              <div style="width:32px;height:1px;background:#c9a84c;margin:0 auto 16px;"></div>
              <p style="margin:0;font-size:13px;color:#c9a84c;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Admiralty Golf Club</p>
              <p style="margin:8px 0 0;font-size:12px;color:#475569;font-family:Arial,sans-serif;">Enjoy your game. See you on the course.</p>
              <p style="margin:16px 0 0;font-size:11px;color:#334155;font-family:Arial,sans-serif;">This is an automated message. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
  };

  try {
    await sgMail.send(msg);
    console.log("Password reset email sent to:", to);
  } catch (error) {
    console.log(
      "SendGrid error:",
      JSON.stringify(error.response?.body ?? error.message, null, 2),
    );
    throw error;
  }
};

module.exports = {
  sendBookingEmail,
  sendGuestCredentialsEmail,
  sendPasswordResetEmail,
};

