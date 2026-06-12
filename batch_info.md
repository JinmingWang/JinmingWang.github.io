`batch.pth` contains a python dictionary with the following items:
- `trajs` (32, 36, 32, 2): 32 samples, each has 36 trajectories, each trajectory has 32 GPS points, and each GPS point has 2 dimensions (latitude and longitude).
- `walks` (32, 36, 8, 8, 2): 32 samples, each has 36 walks (chain of edges), each walk has 8 edges, each edge has 8 GPS points, and each GPS point has 2 dimensions (latitude and longitude).
- `graphs` (32, 133, 8, 2): 32 graphs, each graph has 133 edges, each edge has 8 GPS points, and each GPS point has 2 dimensions (latitude and longitude).
- `N_edges_per_graph` (32,): Number of edges in each graph, the actualy number of edges in each graph is less than or equal to 133, and the rest of the edges are padded with zeros.
- `bbox` (32, 4): Bounding box for each graph, not useful.