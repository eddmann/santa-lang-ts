export interface Obj {
  inspect(): string;
  isTruthy(): boolean;
}

export interface ValueObj extends Obj {
  hashCode(): number;
  equals(that: Obj): boolean;
}
