export class CreateClientDTO {
  constructor(
    public name: string,
    public email: string,
    public cnpj: string
  ) {}
}

export class ClientDTO {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public cnpj: string
  ) {}
}
