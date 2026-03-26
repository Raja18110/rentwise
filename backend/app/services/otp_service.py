import random, time

store={}

 
def generate_otp(email):
        otp=str(random.randint(100000,999999))
        store[email]={"otp":otp,"exp":time.time()+300}
        print("OTP:",otp)

def verify_otp(email, otp):
    d=store.get(email)
    return d and d["otp"]==otp and time.time()<d["exp"]