export class CreateUserDTO {
  constructor(
    public name: string,
    public email: string,
    public password: string
  ) {}
}
