export interface Obj {
  inspect(): string;
  isTruthy(): boolean;
  getName(): string;
}

export interface ValueObj extends Obj {
  hashCode(): number;
  equals(that: Obj): boolean;
}
