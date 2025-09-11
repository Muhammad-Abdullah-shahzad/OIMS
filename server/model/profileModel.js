const db = require("../Database/database").pool;

// Get profile by userId

exports.getProfileById = async (userId, employee_id) => {
  if (userId) {
    const [rows] = await db.execute(
      `SELECT 
            u.id AS userId,
            u.firstName,
            u.lastName,
            u.email,
            p.profile_id AS profileId,
            p.profile_image_url
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = ?`,
      [userId]
    );

    return rows[0];
  } else {
    const [rows] = await db.execute(
      `   SELECT
  e.id,
  e.firstName,
  e.lastName,
  e.designation,
  e.email,
  e.department,
  e.location,
  p.profile_image_url,
  p.profile_id
 FROM employees e
 LEFT JOIN employeeProfiles p ON e.id = p.employee_id
 WHERE e.id = ?`,
      [employee_id]
    );
    return rows[0];
  }
};

// Update profile by profileId

exports.updateProfile = async (
  profileId,
  userId,
  employee_id,
  { profile_image_url }
) => {
  console.log("all values to profileModel " , profileId , userId , employee_id);
  // Update profiles table
  // if profile id is not present then  create a profile else update
  // existing profile
  if (userId) {
    if (!parseInt(profileId)) {
      await db.execute(
        `
            INSERT INTO profiles (user_id,profile_image_url)       
            values(?,?)
            `,
        [userId, profile_image_url]
      );
    } else {
      await db.execute(
        `UPDATE profiles 
         SET profile_image_url = ?
         WHERE profile_id = ?`,
        [profile_image_url, profileId]
      );
    }
  } else if (parseInt(employee_id)) {
    // logic for employee profile
    if (!parseInt(profileId)  && parseInt(employee_id)) {
      await db.execute(
        `
            INSERT INTO employeeProfiles (employee_id,profile_image_url)       
            values(?,?)
            `,
        [employee_id, profile_image_url]
      );
    } else {
      await db.execute(
        `UPDATE employeeProfiles 
         SET profile_image_url = ?
         WHERE profile_id = ?`,
        [profile_image_url, profileId]
      );
    }
  }

  return { message: "Profile updated successfully" };
};
