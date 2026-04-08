# CrisisGrid MongoDB Sharding Strategy

## Strategy Overview
To ensure CrisisGrid can scale to support continental-scale disaster response, we utilize MongoDB's horizontal scaling (sharding) capabilities.

## Shard Key Selection: `zone`
The field `zone` has been selected as the primary **Shard Key** for the `camps`, `needs`, and `alerts` collections.

### Rationale:
1. **Locality of Data**: Disaster coordination is inherently geographical. Operations in "Zone-1" (e.g., North India) rarely require frequent cross-joins with "Zone-5" (e.g., South India). By sharding on `zone`, most operational queries stay localized to a single shard (Targeted Queries).
2. **Cardinality**: The number of zones is high enough to allow even distribution but low enough to maintain manageable chunks.
3. **Write Scaling**: New data is ingested per-zone, ensuring that write load is distributed across the cluster rather than hitting a single primary.

## Data Distribution
Data is distributed across shards based on the `zone` value. 
* Shard A: Zones 1-10
* Shard B: Zones 11-20
* Shard C: Zones 21-30

## Cross-Shard Queries
Queries that do not include the `zone` shard key (e.g., searching for a camp by its `_id` or `name` across all zones) will be processed as **Broadcast Queries**. While theoretically slower, these are limited to high-level coordination tasks, whereas tactical field tasks always use the shard key.

## Implementation Command
To enable sharding on the production cluster, the following commands are executed in the `mongosh`:

```javascript
// 1. Enable sharding for the database
sh.enableSharding("crisigrid")

// 2. Index the shard key
db.camps.createIndex({ zone: 1 })

// 3. Shard the collection
sh.shardCollection("crisigrid.camps", { zone: 1 })
```
