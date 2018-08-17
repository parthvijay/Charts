import json
from pprint import pprint
import sys
import smtplib
import email
from email.mime.text import MIMEText
import os


stage = "4";
dev = "3";
prod = "5"; 
enteredValue = input("please enter your deployment env:")

with open('config.json') as f:
    data = json.load(f)

pprint(data["env"])

if (enteredValue == data["env"]):
   print("you entered a correct env")
   os.system("grunt build --force")
else:
    print("you made a BUMMER!!!!,please check your email")
    fp = open('textFile.txt', 'rb')
    # Create a text/plain message
    msg = MIMEText(fp.read())
    fp.close()
    msg['Subject'] = 'You made a bummer while deploying the code' 
    msg['From'] = "kedeshmu@cisco.com"
    msg['To'] = "kedeshmu@cisco.com"
    s = smtplib.SMTP('outbound.cisco.com')
    s.sendmail("kedeshmu@cisco.com", ["kedeshmu@cisco.com"], msg.as_string())
    s.quit()
   






