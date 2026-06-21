# TinyEdge-AI: Tiny AI for Intrusion Detection on Edge Devices



TinyEdge-AI is a lightweight, edge-optimized Network Intrusion Detection System (NIDS). The system leverages Quantization-Aware Training (QAT) to compress a PyTorch Multilayer Perceptron (MLP) into an INT8 format, making it suitable for deployment on resource-constrained edge routers. It features a React-based interactive dashboard for live monitoring and simulated threat testing.

## Key Features

- **Quantization-Aware Training (QAT):** Compresses the neural network model from FP32 to INT8, significantly reducing memory footprint and accelerating inference on edge devices without catastrophic accuracy loss.
- **Adversarial Training Defense:** Trains the model against adversarial noise (e.g., packet padding, timing variations) to prevent "AI Optical Illusions" where malicious traffic mimics normal traffic.
- **Privacy-Preserving Metadata Analysis:** Operates purely on flow-level metadata (packet length, inter-arrival time, etc.) rather than deep packet inspection (DPI), preserving user privacy (no decryption needed) and processing traffic exponentially faster.
- **Edge Firewall Simulator:** Implements a multi-layered defense mechanism:
  - *Rate Limiting:* Drops volumetric DDoS attacks before they exhaust CPU resources or reach the AI model.
  - *Safety Net (Confidence Thresholds):* Flags zero-day anomalies if the AI predicts traffic is "Normal" but with less than 80% confidence.
- **Secure Model Export:** Encrypts the final trained INT8 model using AES to defend against "Model Extraction" attacks when deployed on edge environments.
- **Interactive Dashboard:** A React + Vite dashboard to visualize live network traffic, hardware utilization, geographic threat mapping, and an active threat log. Includes both a Live Shield (IPS) and a Simulation Lab.
- **Live Packet Sniffing:** Uses Scapy to intercept live network traffic and extract features in real-time.

## Architecture

1. `train_qat_nids.py`: The PyTorch training pipeline. Loads network flow datasets, trains the FP32 model with adversarial noise, performs QAT to produce the INT8 model, tests it with the edge firewall simulator, and securely exports the model.
2. `server.py`: A FastAPI backend that runs the deployed INT8 model. Exposes `/predict` for simulation traffic and `/live_traffic` for real-time traffic analysis using Scapy packet sniffing.
3. `stress_test.py`: A CLI utility to simulate various network attacks: Volumetric UDP DDoS, Adversarial Noise, TCP SYN Floods, and ICMP Ping of Death.
4. `src/`: The frontend application built with React, Vite, Tailwind CSS, and Three.js (for globe visualizations). Communicates with the FastAPI backend.

## Installation & Setup

### 1. Backend Setup

Ensure you have Python 3.8+ installed.

```bash
# Install PyTorch, FastAPI, Scapy, and other dependencies
pip install torch torchvision torchaudio
pip install fastapi uvicorn scapy cryptography psutil requests pandas scikit-learn
```

Run the backend server:
```bash
# For live sniffing to work, you may need to run this with Administrator/Root privileges
python server.py
```

### 2. Frontend Setup

Ensure you have Node.js installed.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Model Training (Optional)

If you wish to train the NIDS model from scratch:
```bash
python train_qat_nids.py
```
*(Note: Requires the CIC-IDS 2017 dataset or will fall back to generating synthetic data for demonstration purposes.)*

### 4. Stress Testing

You can use the included stress testing tool to evaluate the NIDS against simulated attacks:
```bash
python stress_test.py
```
Select the attack type (1-4) when prompted.

## License

This project is open-source and available under the standard MIT License.
