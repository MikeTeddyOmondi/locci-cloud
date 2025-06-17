import { User } from "../entities/userEntity.js";
import UserRepository from "../repositories/userRepository.js";

export default class UserService {
  protected userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string) {
    return await this.userRepository.findById(id);
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async createUser(user: { name: string; email: string; password: string }) {
    return await this.userRepository.create(user);
  }

  async updateUser(id: string, user: { name: string; email: string }) {
    return await this.userRepository.update(id, user);
  }

  async deleteUser(id: string) {
    return await this.userRepository.delete(id);
  }
}
