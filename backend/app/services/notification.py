from app.models.notification import Notification
from app.models.user import User


def create_notification(
    db,
    email,
    message,
    title=None,
    notification_type="general",
    related_id=None,
    user_id=None,
):
    if not user_id and email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user_id = user.id

    notif = Notification(
        email=email,
        message=message,
        title=title,
        notification_type=notification_type,
        related_id=related_id,
        user_id=user_id,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_notifications(db, email):
    return (
        db.query(Notification)
        .filter(Notification.email == email)
        .order_by(Notification.created_at.desc())
        .all()
    )


def mark_read(db, notif_id):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        return None
    notif.status = "read"
    db.commit()
    db.refresh(notif)
    return notif
