export class NotFoundException extends Error {
  public readonly statusCode: number = 404;

  constructor(entity: string, id: number | string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundException';
  }
}
