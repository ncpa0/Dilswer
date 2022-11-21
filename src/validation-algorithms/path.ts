export class Path {
  static init(root: string) {
    const path = new Path();
    path.part = root;
    return path;
  }

  private previous?: Path;
  private part!: string | number;

  concat(nextPart: string | number) {
    const next = new Path();
    next.previous = this;
    next.part = nextPart;
    return next;
  }

  flatten() {
    const parts: string[] = [];
    let current: Path | undefined = this;
    while (current) {
      parts.push(current.part.toString());
      current = current.previous;
    }
    return parts.reverse();
  }
}
