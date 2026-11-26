import { Notification } from "../models/Notification.js";

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { userUid, role, email, category, unreadOnly } = req.query;

    const recipientConditions = ["all"];
    if (userUid) recipientConditions.push(userUid);
    if (email) recipientConditions.push(email.toLowerCase());
    if (role) recipientConditions.push(`role:${role.toLowerCase()}`);

    const filter = {
      recipient: { $in: recipientConditions },
    };

    if (category && category !== "all") {
      filter.category = category;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(60);

    // Map through notifications and compute user-specific read status
    const data = notifications.map((item) => {
      const isBroadcast = item.recipient === "all" || item.recipient.startsWith("role:");
      const isRead = isBroadcast
        ? (userUid ? item.readBy.includes(userUid) : item.read)
        : item.read;

      return {
        id: item._id,
        recipient: item.recipient,
        title: item.title,
        message: item.message,
        type: item.type,
        category: item.category,
        link: item.link,
        read: isRead,
        metadata: item.metadata,
        createdAt: item.createdAt,
      };
    });

    const filtered = unreadOnly === "true" ? data.filter((n) => !n.read) : data;
    const unreadCount = data.filter((n) => !n.read).length;

    res.json({
      success: true,
      count: filtered.length,
      unreadCount,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications (Create notification or broadcast announcement)
export const createNotification = async (req, res, next) => {
  try {
    const {
      recipient = "all",
      title,
      message,
      type = "info",
      category = "general",
      link = "",
      metadata = {},
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required for notification",
      });
    }

    const notification = await Notification.create({
      recipient,
      title: title.trim(),
      message: message.trim(),
      type,
      category,
      link,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read (Mark single notification as read)
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userUid } = req.body;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const isBroadcast =
      notification.recipient === "all" || notification.recipient.startsWith("role:");

    if (isBroadcast && userUid) {
      if (!notification.readBy.includes(userUid)) {
        notification.readBy.push(userUid);
      }
    } else {
      notification.read = true;
    }

    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all (Mark all notifications as read for a user)
export const markAllAsRead = async (req, res, next) => {
  try {
    const { userUid, role } = req.body;

    const recipientConditions = [];
    if (userUid) recipientConditions.push(userUid);
    if (role) recipientConditions.push(`role:${role.toLowerCase()}`);

    // Mark direct user notifications as read
    if (recipientConditions.length > 0) {
      await Notification.updateMany(
        { recipient: { $in: recipientConditions } },
        { $set: { read: true } }
      );
    }

    // Mark broadcast notifications by appending userUid to readBy
    if (userUid) {
      await Notification.updateMany(
        { recipient: { $in: ["all", `role:${role?.toLowerCase()}`] } },
        { $addToSet: { readBy: userUid } }
      );
    } else {
      // General mark all
      await Notification.updateMany({}, { $set: { read: true } });
    }

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id (Delete notification)
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/clear-read (Clear read notifications for user)
export const clearReadNotifications = async (req, res, next) => {
  try {
    const { userUid } = req.body;

    if (userUid) {
      await Notification.deleteMany({
        recipient: userUid,
        read: true,
      });
    } else {
      await Notification.deleteMany({ read: true });
    }

    res.json({
      success: true,
      message: "Cleared read notifications",
    });
  } catch (error) {
    next(error);
  }
};
