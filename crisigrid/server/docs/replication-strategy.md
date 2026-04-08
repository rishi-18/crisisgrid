# CrisisGrid MongoDB Replication Strategy

## High Availability Overview
Consistency and data durability are critical in disaster response. CrisisGrid utilizes a **3-Node Replica Set** architecture to maintain operational force even during server failures.

## 3-Node Architecture
1. **Primary Node**: Handles all write operations and default read operations. Processes incoming resource updates and alert triggers.
2. **Secondary Node 1**: Continually replicates data from the Primary. Ready to take over as Primary within seconds (Electable).
3. **Secondary Node 2**: A second fully synchronized copy of the database. Provides redundant failover and can be used for read-only analytical workloads.

## Automatic Failover
If the Primary Node enters an unreachable state (e.g., a data center outage in Zone-1), the two Secondary nodes will immediately hold an **Election**. A new Primary is elected, and the application remains online with zero data loss. This is handled automatically by **MongoDB Atlas**.

## Read Preference Strategy
* **Writes**: Always directed to the Primary.
* **Reads**: `primaryPreferred` (Reads hit the Primary for maximum consistency; falls back to secondaries in an outage). For high-volume Analytics workflows, `secondary` preference is used to offload work from the Primary.

## Connection String
Our MongoDB Atlas connection string includes the `replicaSet` parameter for automated node discovery:

```bash
mongodb+srv://user:password@cluster.mongodb.net/crisigrid?replicaSet=rs0&readPreference=primaryPreferred&retryWrites=true&w=majority
```

## Consensus
All writes use `{ w: "majority" }` to ensure data has reached at least 2 out of 3 nodes before returning success, preventing "phantom writes" during network partitions.
