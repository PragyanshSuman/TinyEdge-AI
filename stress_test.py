import socket
import time

print("Initiating local UDP Flood Simulation (DDoS) against localhost...")
print("This will generate >5000 packets per second.")
print("Press CTRL+C to stop the attack.")

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
payload = b"X" * 1024  # 1KB payload per packet

try:
    while True:
        # We send to an external IP (like Google's DNS) so the packets 
        # are forced to go through your physical network card.
        # (They will just be dropped by the router/ISP, but Scapy will see them first!)
        s.sendto(payload, ("8.8.8.8", 9999))
except KeyboardInterrupt:
    print("\nAttack stopped.")
