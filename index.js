const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const prefix = "?";

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log("Ready!");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// Handle "?" commands
client.on(Events.MessageCreate, async (message) => {
  const isQuestionCommand = message.content.startsWith(prefix);
  const questionCommand = message.content
    .slice(
      prefix.length,
      message.content.indexOf(" ") !== -1
        ? message.content.indexOf(" ")
        : undefined
    )
    .toLowerCase();

  if (!isQuestionCommand) return;

  if (questionCommand === "help") {
    client.channels.fetch(message.channelId).then(async (channel) => {
      await channel.send(
        "Built in commands: help, create, update, delete" +
          "\n\n" +
          "Usages:\n " +
          "?create [commandName] [commandContent]\n\n" +
          "?update [commandName] [newCommandContent]\n\n" +
          "?delete [commandName]\n\n"
      );
    });
  } else if (questionCommand === "create") {
    const endOfName = message.content.indexOf(" ", questionCommand.length + 2);
    const commandName = message.content.substring(
      questionCommand.length + 2,
      endOfName
    );
    const commandContent = message.content.substring(endOfName + 1);

    await prisma.command.create({
      data: {
        name: commandName,
        content: commandContent,
      },
    });
    client.channels.fetch(message.channelId).then(async (channel) => {
      await channel.send(`${commandName} command has been successfully added.`);
    });
  } else if (questionCommand === "delete") {
    const commandToDelete = message.content.substring(
      questionCommand.length + 2
    );

    await prisma.command.delete({
      where: {
        name: commandToDelete,
      },
    });

    client.channels.fetch(message.channelId).then(async (channel) => {
      await channel.send(
        `${commandToDelete} command has been successfully deleted.`
      );
    });
  } else if (questionCommand === "update") {
    const endOfName = message.content.indexOf(" ", questionCommand.length + 2);
    const commandName = message.content.substring(
      questionCommand.length + 2,
      endOfName
    );
    const commandContent = message.content.substring(endOfName + 1);

    await prisma.command.update({
      data: {
        content: commandContent,
      },
      where: {
        name: commandName,
      },
    });
    client.channels.fetch(message.channelId).then(async (channel) => {
      await channel.send(
        `${commandName} command has been successfully updated.`
      );
    });
  } else {
    const record = await prisma.command.findUnique({
      where: {
        name: questionCommand,
      },
    });

    if (!record) return;

    client.channels.fetch(message.channelId).then(async (channel) => {
      await channel.send(record.content);
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
