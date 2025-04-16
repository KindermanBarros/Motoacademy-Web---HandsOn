import type { IUserRepository } from '../../../domain/Users/repositories/UserRepository';

interface ValidateLoginRequest {
  email: string;
  password: string;
}

interface ValidateLoginResponse {
  success: boolean;
  message: string;
  userId?: number;
  role?: string;
}

export class ValidateLogin {
  constructor(private usersRepository: IUserRepository) {}

  async execute({
    email,
    password
  }: ValidateLoginRequest): Promise<ValidateLoginResponse> {
    const user = await this.usersRepository.getByEmail(email);

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    return {
      success: true,
      message: 'Login successful',
      userId: user.id,
      role: user.role
    };
  }
}
