import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
    @type("number") id: number;
    @type("string") name: string;
    @type("boolean") isActive: boolean;
    @type("boolean") connected: boolean;

    constructor(id: number, name: string) {
        super();
        this.id = id;
        this.name = name;
        this.isActive = false;
        this.connected = true;
    }

    toggleActive() {
        this.isActive = !this.isActive;
    }
}