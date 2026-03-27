from app.models.notification import Notification

def create_notification(db, email, message):
    notif = Notification(email=email, message=message)
    db.add(notif)
    db.commit()
    return notif


def get_notifications(db, email):
    return db.query(Notification).filter(Notification.email == email).all()


def mark_read(db, notif_id):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    notif.status = "read"
    db.commit()
    return notif