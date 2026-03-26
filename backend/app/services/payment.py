# services/payment_service.py
import razorpay

client = razorpay.Client(auth=("YOUR_KEY","YOUR_SECRET"))

def create_order(amount):
    order = client.order.create({
        "amount": int(amount*100),
        "currency": "INR",
        "payment_capture": 1
    })
    return order