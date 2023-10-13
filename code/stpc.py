import json
import random

def obscure_cipher(s):
    result = ''.join([chr(ord(c) ^ 42) for c in s])
    return result

def obscure_decipher(s):
    result = ''.join([chr(ord(c) ^ 42) for c in s])
    return result

def create_password():
    # Generate a random 4-digit code
    password = str(random.randint(1000, 9999))
    print(f"Your generated password is: {password}")
    with open('secure_data.json', 'w') as f:
        json.dump({"unrelated_data": obscure_cipher(password)}, f)
    print("Password saved.")

def retrieve_password():
    answer = input('Social and cognitive risks. Type in "cognition":')
    if answer.lower() == 'cognition':
        with open('secure_data.json', 'r') as f:
            stored_data = json.load(f)
        print("Your password is:", obscure_decipher(stored_data["unrelated_data"]))
    else:
        print("Incorrect answer. Access denied.")

while True:
    action = input("Do you want to (c)reate or (r)etrieve the password, or (q)uit? ")
    if action.lower() == 'c':
        create_password()
    elif action.lower() == 'r':
        retrieve_password()
    elif action.lower() == 'q':
        break
    else:
        print("Invalid choice.")
