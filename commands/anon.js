const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anon")
    .setDescription("Makes your message anonymous.")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to make anonymous")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const response =
      interaction.options.getString("message") ?? "no string provided";
    interaction.reply({ content: response, ephemeral: true });
    const channel = await client.channels.fetch(interaction.channelId);
    await channel.send(response);
  },
};
