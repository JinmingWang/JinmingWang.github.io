import pickle
import json
import numpy as np

# Try loading with pickle first (PyTorch files are often pickled)
try:
    with open('batch.pth', 'rb') as f:
        batch = pickle.load(f)
    print("Loaded using pickle")
except Exception as e:
    print(f"Pickle failed: {e}")
    # If pickle fails, try with torch
    try:
        import torch
        batch = torch.load('batch.pth', map_location='cpu')
        print("Loaded using torch")
    except ImportError:
        print("Error: Neither pickle worked nor is torch installed.")
        print("Please install torch: pip install torch")
        exit(1)

# Convert tensors/arrays to lists for JSON serialization
data = {}

for key, value in batch.items():
    if hasattr(value, 'numpy'):  # torch.Tensor
        data[key] = value.cpu().numpy().tolist() if hasattr(value, 'cpu') else value.numpy().tolist()
    elif isinstance(value, np.ndarray):
        data[key] = value.tolist()
    else:
        data[key] = value

# Save to JSON file
with open('batch_data.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Conversion complete! Data saved to batch_data.json")
print(f"File size: {len(json.dumps(data)) / 1024 / 1024:.2f} MB")

# Print data structure info
print("\nData structure:")
for key, value in data.items():
    if isinstance(value, list):
        # Get the shape by traversing nested lists
        shape = []
        temp = value
        while isinstance(temp, list):
            shape.append(len(temp))
            temp = temp[0] if len(temp) > 0 else None
        print(f"  {key}: shape {tuple(shape)}")
    else:
        print(f"  {key}: {type(value)}")
