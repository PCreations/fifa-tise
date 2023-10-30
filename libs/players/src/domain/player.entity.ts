export class PlayerEntity {
  constructor(
    private readonly props: {
      id: string;
      email: string;
      name: string;
    },
  ) {}

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }
}
