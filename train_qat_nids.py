# Project: Tiny AI for Intrusion Detection on Edge Devices
# Lead Developer: Roshan Kumar Mohanta (RA2311026010713)

import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import TensorDataset, DataLoader
import torch.ao.quantization
from cryptography.fernet import Fernet

# Handle Anaconda environment C-extension ABI conflicts gracefully
try:
    import pandas as pd
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix
    SKLEARN_AVAILABLE = True
except ImportError as e:
    print(f"\n[Environment Warning]: {e}")
    print("Falling back to pure PyTorch synthetic data generation for demonstration.\n")
    SKLEARN_AVAILABLE = False

# -----------------------------
# 1. Data Preprocessing (The "Envelope/Metadata" Novelty)
# -----------------------------
def load_and_preprocess_data(file_path):
    print(f"Loading dataset from {file_path}...")
    
    if SKLEARN_AVAILABLE:
        try:
            df = pd.read_csv(file_path)
            df.columns = df.columns.str.strip()
            
            # Clean data
            df.replace([np.inf, -np.inf], np.nan, inplace=True)
            df.dropna(inplace=True)
            
            label_col = 'Label' if 'Label' in df.columns else df.columns[-1]
            y = df[label_col]
            
            # Crucial Feature Selection: Filter dataset to only include flow-level metadata features
            # Cybersecurity Reasoning: By analyzing ONLY metadata (packet size, inter-arrival time, flag counts) 
            # instead of Deep Packet Inspection (DPI) on payloads, the AI preserves user privacy 
            # (it doesn't read the encrypted contents of the traffic) and processes packets exponentially faster.
            metadata_keywords = ['packet length', 'pkt size', 'iat', 'flag', 'flow duration', 'bytes']
            selected_features = [col for col in df.columns if any(kw in col.lower() for kw in metadata_keywords)]
            
            if not selected_features:
                # Fallback if the CSV doesn't have standard CIC-IDS column names
                selected_features = df.columns[:-1].tolist()
                
            X = df[selected_features].select_dtypes(include=[np.number])
            
            label_encoder = LabelEncoder()
            y_encoded = label_encoder.fit_transform(y)
            print(f"Classes Found: {label_encoder.classes_}")
            
            X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            input_dim = X_train.shape[1]
            num_classes = len(label_encoder.classes_)
            
            X_train_tensor = torch.tensor(X_train_scaled, dtype=torch.float32)
            y_train_tensor = torch.tensor(y_train, dtype=torch.long)
            X_test_tensor = torch.tensor(X_test_scaled, dtype=torch.float32)
            y_test_tensor = torch.tensor(y_test, dtype=torch.long)

            train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
            test_dataset = TensorDataset(X_test_tensor, y_test_tensor)

            train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
            test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)

            return train_loader, test_loader, input_dim, num_classes, label_encoder
            
        except Exception as e:
            print(f"File loading error: {e}. Generating mock data instead.")
            return generate_mock_data()
    else:
        return generate_mock_data()

def generate_mock_data():
    input_dim = 15 # Simulating Flow-level metadata features
    num_classes = 3 # e.g., Normal, DDoS, PortScan
    print("Generating Learnable Synthetic Network Metadata Traffic...")
    
    # Generate structured data where different classes have distinct mathematical patterns
    # so the Multilayer Perceptron actually has something to learn, resulting in >95% accuracy!
    X_train_tensor = torch.randn(800, input_dim)
    y_train_tensor = torch.randint(0, num_classes, (800,))
    for i in range(800):
        X_train_tensor[i] += y_train_tensor[i] * 4.0  # Shift the mean based on the class

    X_test_tensor = torch.randn(200, input_dim)
    y_test_tensor = torch.randint(0, num_classes, (200,))
    for i in range(200):
        X_test_tensor[i] += y_test_tensor[i] * 4.0

    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    test_dataset = TensorDataset(X_test_tensor, y_test_tensor)

    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)
    
    return train_loader, test_loader, input_dim, num_classes, None

# -----------------------------
# 2. Adversarial Training (Defending against "The AI Optical Illusion")
# -----------------------------
def generate_adversarial_noise(inputs, noise_level=0.05):
    """
    Cybersecurity Reasoning: Hackers attempt to bypass ML systems by slightly altering 
    their attack timing (Inter-Arrival Time) or padding packet sizes to make malicious 
    traffic mathematically resemble "Normal" traffic (an AI optical illusion).
    This function adds random perturbations to simulate these evasive techniques,
    forcing the AI to learn the underlying threat pattern rather than memorizing exact values.
    """
    # Create a random noise tensor of the same shape as the inputs
    noise = torch.randn_like(inputs) * noise_level
    adversarial_inputs = inputs + noise
    return adversarial_inputs

# -----------------------------
# 3. Model Architecture (The QAT "Brain Shrink" Novelty)
# -----------------------------
class TinyEdgeNIDS(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(TinyEdgeNIDS, self).__init__()
        # Cybersecurity Reasoning: QAT stubs track activation statistics during training 
        # so the model knows how to optimally compress FP32 weights into 8-bit integers (INT8) 
        # without catastrophic accuracy loss. This allows deployment on weak edge routers.
        self.quant = torch.ao.quantization.QuantStub()
        
        # Lightweight MLP suitable for table-based metadata inputs
        self.fc1 = nn.Linear(input_dim, 64)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(64, 32)
        self.relu2 = nn.ReLU()
        self.fc3 = nn.Linear(32, num_classes)
        
        self.dequant = torch.ao.quantization.DeQuantStub()

    def forward(self, x):
        x = self.quant(x)
        x = self.fc1(x)
        x = self.relu1(x)
        x = self.fc2(x)
        x = self.relu2(x)
        x = self.fc3(x)
        x = self.dequant(x)
        return x

    def fuse_model(self):
        # Fuse Linear and ReLU modules to optimize memory efficiency before QAT
        torch.ao.quantization.fuse_modules(self, [['fc1', 'relu1'], ['fc2', 'relu2']], inplace=True)

# -----------------------------
# 4. The Training & QAT Pipeline
# -----------------------------
def train_model(model, train_loader, test_loader, epochs=5, lr=0.001):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        for inputs, labels in train_loader:
            optimizer.zero_grad()
            
            # Forward pass with CLEAN data
            outputs = model(inputs)
            loss_clean = criterion(outputs, labels)
            
            # Forward pass with ADVERSARIAL data (Defending against "The AI Optical Illusion")
            adv_inputs = generate_adversarial_noise(inputs)
            outputs_adv = model(adv_inputs)
            loss_adv = criterion(outputs_adv, labels)
            
            # Combine losses
            loss = loss_clean + (0.5 * loss_adv)
            
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

def prepare_and_train_qat(model, train_loader, test_loader, epochs=2):
    print("\nStarting Phase 2: Quantization-Aware Training (QAT)...")
    model.train()
    model.qconfig = torch.ao.quantization.get_default_qat_qconfig('fbgemm')
    model.fuse_model()
    torch.ao.quantization.prepare_qat(model, inplace=True)
    
    # Fine-tune to adapt to 8-bit limits
    train_model(model, train_loader, test_loader, epochs=epochs, lr=0.0001)
    
    model.eval()
    int8_model = torch.ao.quantization.convert(model, inplace=False)
    print("QAT conversion to INT8 successful.")
    return int8_model

# -----------------------------
# 5. Edge Inference Simulator 
# -----------------------------
class EdgeRouterFirewall:
    def __init__(self, ai_model, normal_class_index=0):
        self.model = ai_model
        self.model.eval()
        self.normal_class_index = normal_class_index
        self.packet_counter = 0

    def process_traffic(self, traffic_features, current_packets_per_sec):
        """
        Cybersecurity Reasoning: Simulates a hardware firewall sitting in front of the AI.
        """
        # Defense 1: Rate Limiting ("Smash the Doorbell" Defense)
        # Prevents CPU exhaustion from volumetric DDoS attacks before they even reach the heavy AI model.
        if current_packets_per_sec > 1000:
            return "THREAT BLOCKED: Volumetric DDoS (Rate Limit Exceeded)"
        
        # Pass to the AI for behavioral analysis
        with torch.no_grad():
            logits = self.model(traffic_features)
            # Use Softmax to convert raw logits into percentage probabilities
            probabilities = F.softmax(logits, dim=1)
            
            confidence, predicted_class = torch.max(probabilities, 1)
            confidence_score = confidence.item()
            predicted_idx = predicted_class.item()
            
            # Defense 2: Confidence Thresholds ("The Safety Net")
            # If the AI predicts the traffic is "Normal" but is less than 80% confident, 
            # we default to blocking it (fail-secure design) as it might be a novel Zero-Day anomaly.
            if predicted_idx == self.normal_class_index and confidence_score < 0.80:
                return f"THREAT BLOCKED: Low-Confidence Normal ({confidence_score*100:.1f}%) -> Zero-Day Anomaly Flagged"
            
            if predicted_idx != self.normal_class_index:
                return f"THREAT BLOCKED: AI Classification (Confidence: {confidence_score*100:.1f}%)"
                
            return "TRAFFIC ALLOWED: Normal Behavior"

# -----------------------------
# 6. Secure Export (Defending against "Model Extraction")
# -----------------------------
def encrypt_model_file(filepath):
    """
    Cybersecurity Reasoning: "Model Extraction" is an attack where hackers steal the weights of an AI 
    deployed on an edge device to find its blind spots. By encrypting the TorchScript output using AES, 
    we simulate exporting the model to a Secure Enclave (e.g., ARM TrustZone) where it remains encrypted at rest.
    """
    key = Fernet.generate_key()
    fernet = Fernet(key)
    
    with open(filepath, 'rb') as file:
        original_model_bytes = file.read()
        
    encrypted_model = fernet.encrypt(original_model_bytes)
    
    encrypted_filepath = filepath + ".enc"
    with open(encrypted_filepath, 'wb') as enc_file:
        enc_file.write(encrypted_model)
        
    print(f"Model successfully encrypted and saved to {encrypted_filepath}")
    print(f"[SECURITY] Store this AES key securely on the device TPM: {key.decode()}")

if __name__ == '__main__':
    dataset_file = 'cic_ids_2017.csv'
    
    # 1. Preprocess Data
    train_loader, test_loader, input_dim, num_classes, label_encoder = load_and_preprocess_data(dataset_file)
    
    print(f"\nInitialized TinyEdgeNIDS Architecture (Input Dim: {input_dim}, Classes: {num_classes})")
    fp32_model = TinyEdgeNIDS(input_dim, num_classes)
    
    # Phase 1: FP32 Training with Adversarial Defenses
    print("\n--- Starting Phase 1: Baseline FP32 Training (with Adversarial Noise) ---")
    train_model(fp32_model, train_loader, test_loader, epochs=5)

    torch.save(fp32_model.state_dict(), 'tiny_edge_nids_fp32.pt')
    
    # Phase 2: QAT
    int8_model = prepare_and_train_qat(fp32_model, train_loader, test_loader, epochs=2)
    
    # Run Edge Inference Simulator
    print("\n--- Testing Edge Inference Simulator Defenses ---")
    firewall = EdgeRouterFirewall(ai_model=int8_model, normal_class_index=0)
    
    dummy_traffic = next(iter(test_loader))[0][0].unsqueeze(0)
    
    print("Testing Normal Packet Rate (200 p/s):", firewall.process_traffic(dummy_traffic, 200))
    print("Testing Volumetric DDoS Rate (2500 p/s):", firewall.process_traffic(dummy_traffic, 2500))
    
    # Final Export
    traced_int8_model = torch.jit.trace(int8_model, dummy_traffic)
    traced_int8_model.save('tiny_edge_nids_int8.pt')
    print("\nModel successfully exported to TorchScript 'tiny_edge_nids_int8.pt'")
    
    # 6. Secure Export (Encryption)
    encrypt_model_file('tiny_edge_nids_int8.pt')
