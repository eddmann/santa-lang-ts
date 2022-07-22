export interface Obj {
  inspect(): string;
}

export interface ValueObj extends Obj {
  hashCode(): number;
  equals(that: Obj): boolean;
}
