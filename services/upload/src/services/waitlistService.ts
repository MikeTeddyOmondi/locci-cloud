import WaitlistRepository from "../repositories/waitlistRepository";

export default class WaitlistService {
  protected waitlistRepository: WaitlistRepository;

  constructor() {
    this.waitlistRepository = new WaitlistRepository();
  }

  async getWaitlistById(id: number) {
    return await this.waitlistRepository.findById(id);
  }

  async getAllWaitlist() {
    return await this.waitlistRepository.findAll();
  }

  async createWaitlist(waitlist: { email: string }) {
    return await this.waitlistRepository.create(waitlist);
  }

  async updateWaitlist(id: number, waitlist: { email: string }) {
    return await this.waitlistRepository.update(id, waitlist);
  }

  async deleteWailtlist(id: number) {
    return await this.waitlistRepository.delete(id);
  }
}
