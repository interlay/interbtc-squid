import { Entity, Store } from "@subsquid/typeorm-store";

export default class EntityBuffer {
    buffer = new Map<String, Entity[]>();

    async pushEntity(key: string, entity: Entity) {
        if (!this.buffer.has(key)) {
            this.buffer.set(key, []);
        }
        this.buffer.get(key)!.push(entity);
    }

    async flush(store: Store) {
        for (const [, entities] of this.buffer) {
            await store.save(entities);
        }
        this.buffer.clear();
    }
};
