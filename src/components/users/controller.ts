import twilioClient from '../../config/twilio';

export default {
  async inviteUser(inviter: string, inviteePhone: string) {
    return twilioClient.messages.create({
      body: `The user ${inviter} has invited you to install and play Wordle!`,
      from: process.env.TWILIO_PHONE,
      to: inviteePhone,
    });
  },
};
