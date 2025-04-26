require('dotenv').config();

const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  PermissionsBitField, 
  EmbedBuilder, 
  ChannelType,
  Events,
  ButtonBuilder,  
  ButtonStyle,
  ActionRowBuilder,
  Collection
} = require('discord.js');

const Rcon = require('rcon');

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  console.error('🔥 Unhandled promise rejection:', error);
});

// Create a new instance of the client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let rcon = null;
let rconReconnectTimeout = null;

function connectRcon() {
  if (rcon) {
    try {
      rcon.disconnect();
    } catch (err) {
      console.error('Error disconnecting RCON:', err);
    }
  }

  // ✅ Corrected RCON password
  rcon = new Rcon('139.99.61.4', 7784, 'GarudaCloud');

  rcon.on('auth', () => {
    console.log('RCON authenticated');
    clearTimeout(rconReconnectTimeout);

    // Start fetching player list periodically
    setInterval(() => {
      if (rcon && rcon.hasAuthed) {
        fetchPlayerList(); // Make sure you define this function elsewhere
      }
    }, 60000); // Update every minute
  });

  rcon.on('error', (err) => {
    console.error('RCON error:', err);
    scheduleReconnect();
  });

  rcon.on('end', () => {
    console.log('RCON connection ended');
    scheduleReconnect();
  });

  try {
    rcon.connect();
  } catch (err) {
    console.error('RCON connection error:', err);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (!rconReconnectTimeout) {
    rconReconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect RCON...');
      connectRcon();
    }, 5000); // Try to reconnect after 5 seconds
  }
}


// Rest of your existing constants
const taggedUsers = new Map();//dm
const cooldowns = new Map(); //dm
const messageLinkMap = new Map(); // ic name reaction button
//channels
const OOC_CHANNEL_ID = '1235456789005467709';
const BUG_REPORT_CHANNEL_ID = '1297589010792972359';
const BANNED_WORDS_CHANNEL_ID = '1365082168035901584';
const PLAYER_LIST_CHANNEL_ID = '1235455130015498271';
const CHANNEL_IC_NAME = '1282388155147878514';
const CHANNEL_IC_REGISTER = '1365703222450323486';
const CHANNEL_WHITELIST_QUERIES = '1235455592357826621'; 
//roles
const XT_TEAM_ROLE = '1254368335307603978';

// List of banned words/phrases (including variations with spaces)
const bannedWords = ['ogay', 'oths', 'miru', 'polu', 'unga amma', 'umbu', 'thevidiya', 'otha', 'omala','lavda','polu','thai oli','Otha','soker','poda punda','punda'];

const keywords = ['vp', 'voice process', 'when can i attend vp','Epo Bro Vp','Bro epidi ic la play panurathu?','how can i play in server?','where shuld i do verification','enga verify pananum','Visa venum','visa','visaprocess','Visa Process']; 

const responseMessage = `
  - Update your IC name in Discord by selecting the appropriate role:\n <#1282388155147878514>  
- Get the server IP address from this channel: <#1235455103641583646>  
- Join the server register in-game to get Whiteliste.  
- Contact <@&${XT_TEAM_ROLE}> after registration to get **whitelisted**.  
- Once whitelisted, you'll receive a verification code. Use the following command in <#1359891283480678480> to link your account:
\`\`\`
$Connectx [your_code]
\`\`\`  
- After successful verification, you'll have full access to the server.

**Note:** Please follow each step carefully to avoid delays.
`;

// Function to check for banned words, even split across spaces
function containsBannedWord(messageContent) {
  const cleanedMessage = messageContent.toLowerCase().replace(/\s+/g, '').trim();
  return bannedWords.some(word => cleanedMessage.includes(word));
}

// Define commands object
const commands = {
  ping: async (message) => {
    await message.channel.sendTyping();
    setTimeout(() => {
      message.channel.send('Pong!');
    }, 1000);
  },
  server: async (message) => {
    // Check if the message is coming from the correct server
    if (message.guild.id !== '1068762490516807802') {
      return; // Do nothing if it's not the correct server
    }

    const embed = new EmbedBuilder()
      .setColor('#be00be')
      .setTitle('X-Treme Roleplay Server Info')
      .addFields(
        { name: 'Created On', value: '28 January 2023 at 10:50AM', inline: false },
        { name: 'AIM', value: 'To provide a relaxing and stress-free roleplay experience for players. Connect with others, enjoy events, and dive into immersive RP scenarios.', inline: false },
        { name: 'Admin Assist Roles', value: `XT_TEAM_ROLE`, inline: false },
        { name: 'Official Bot', value: '<@1150330690001448960>', inline: false },
        { name: 'Special  Bot', value: '<@1316349866770694164>', inline: false }
      )
      .addFields(
        { name: 'Watch our server video', value: '[Click here to watch](https://cdn.discordapp.com/attachments/1359947290705395834/1365209018146230292/xtreme-xtrp.mp4?ex=680c797a&is=680b27fa&hm=d864255b3c56f791db61e77231fd697f7e0b058f0cf7ed23c36950e5ccf05089&)', inline: false }
      )
      .setImage('https://media.discordapp.net/attachments/1235461784698359829/1365215829301399652/Picsart_24-04-21_12-02-02-064.jpg?ex=680c7fd2&is=680b2e52&hm=038f7d27b005c7ffcd998eba14729ba63b9842c24144fe96002e8a3af26420e2&=&format=webp&width=1475&height=800')
      .setFooter({ text: 'Alan`s Assistant' });

    // Send the embed
    await message.channel.sendTyping();
    setTimeout(async () => {
      await message.channel.send({ embeds: [embed] });
    }, 1200);
  },  
  staff: async (message) => {
    await message.channel.sendTyping();
    setTimeout(() => {
      message.channel.send('Here is our Staff Team:\n<@1067653850259009566>,\n <@1113535399013388359>,\n <@1010936448851124254>,\n<@846323385884868669>');
    }, 1000);
  },

  sub: async (message) => {
    const embed = new EmbedBuilder()
      .setTitle('Want the Subscriber Role?')
      .setDescription('Follow these steps to get the **Subscriber** role in our server:')
      .addFields(
        { name: 'Step 1', value: 'Subscribe to our official YouTube channel.' },
        { name: 'Step 2', value: 'Take a clear screenshot as proof.' },
        { name: 'Step 3', value: 'Upload it in <#1311365020428533832>.' }
      )
      .setColor('#be00be')
      .setFooter({ text: 'Thanks for supporting X-Treme RP!' });

    await message.channel.sendTyping();
    setTimeout(() => {
      message.channel.send({ embeds: [embed] });
    }, 1000);
  },  

msg: async (message) => {
    const args = message.content.slice(1).trim().split(' ');
    args.shift();
    const mentionedUser = message.mentions.users.first();
    const customMessage = args.slice(1).join(' ');

    if (!mentionedUser || !customMessage) {
      message.channel.send('❗ Please mention a user and provide a message to send.\n📌 Usage:\n```xmsg @user [Your message here]```');
      return;
    }

    const hasEveryoneMention = customMessage.includes('@everyone') || customMessage.includes('@here');
    if (hasEveryoneMention && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      message.channel.send('🚫 You do not have permission to use `@everyone` or `@here` in messages.');
      return;
    }

    // Get the current time
    const now = Date.now();
    const cooldownTime = 900000; // 15 minutes in milliseconds
    const lastUsed = cooldowns.get(message.author.id);

    // Check if the user is in cooldown
    if (lastUsed && now - lastUsed < cooldownTime) {
      const timeLeft = Math.ceil((cooldownTime - (now - lastUsed)) / 1000); // time left in seconds
      message.channel.send(`❌ You need to wait ${timeLeft} more seconds before sending another message.`);
      return;
    }

    // Set the cooldown timestamp for the user
    cooldowns.set(message.author.id, now);

    await message.channel.sendTyping();
    setTimeout(async () => {
      try {
        await mentionedUser.send(`📬 **You have a message from ${message.author.tag}:**\n<@${mentionedUser.id}> ${customMessage}`);
        message.channel.send(`✅ Your message has been sent to ${mentionedUser.tag}'s DM.`);
      } catch (err) {
        console.error(err);
        message.channel.send('❌ Failed to send the message. The user might have DMs disabled.');
      }
    }, 1500);
  },

  occ: async (message) => {
    await message.channel.sendTyping();
    setTimeout(() => {
      message.channel.send('❗ Invalid Syntax\n📌 Usage: `xocc @user [Your message here]`.\nSend an out-of-character message to a user.');
    }, 1000);
  },

  help: async (message) => {
    await message.channel.sendTyping();
    setTimeout(() => {
      message.channel.send(
        "**📜 List of Available Commands**\n\n" +
        "**Prefix:** `x`\n\n" +
        "- **xhelp** - Display this help message\n" +
        "-**xmsg @user** [message]` - Send a direct message to a user\n" +
        "- **xserver** - Show server information"
      );
    }, 1000);
  },  

  occ: async (message) => {
    const args = message.content.slice(1).trim().split(' ');

    const mentionedUser = message.mentions.users.first();
    const customMessage = args.slice(1).join(' ');

    if (!mentionedUser || !customMessage) {
      await message.channel.send('❗ Please mention a user and provide a message to send.\n📌 Usage:\n```xocc @user [Your message here]```');
      return;
    }

    const hasEveryoneMention = customMessage.includes('@everyone') || customMessage.includes('@here');
    if (hasEveryoneMention && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.channel.send('🚫 You do not have permission to use `@everyone` or `@here` in messages.');
      return;
    }

    await message.channel.send(` ${mentionedUser}\n\n Join Drag Me Vc Now!`);
    await message.delete();
  },

  embed: async (message) => {
    const embed = new EmbedBuilder()
      .setColor(0xbe00be)
      .setTitle('📌 Welcome to X-Treme RP!')
      .setDescription('Join the community, explore stories, and enjoy the ultimate RP experience!')
      .setFooter({ text: 'Stay IC, stay cool 😎' });

    await message.channel.send({ embeds: [embed] });
  },

  unknown: async (message) => {
    await message.channel.sendTyping();
    setTimeout(() => {
      message.channel.send('❓ Unknown command. Type `xhelp` for a list of available commands.');
    }, 1000);
  }
};

// Bot ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Initialize RCON connection
  connectRcon();

  const statuses = [
    { name: 'Over X-Treme ', type: ActivityType.Watching },
    { name: 'X-Treme RolePlay', type: ActivityType.Custom },
    { name: 'Bore Adikutha Boss? X-Treme Vaga!', type: ActivityType.Listening },
    { name: 'RolePlay Pvp Illa And Pvp RolePlay Illa', type: ActivityType.Playing },
    { name: 'Bomy Youtube Discord', type: ActivityType.Watching }
  ];

  let index = 0;

  setInterval(() => {
    client.user.setPresence({
      activities: [statuses[index]],
      status: 'dnd'
    });
    index = (index + 1) % statuses.length;
  }, 9000);
});

// Message events
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const lowercaseContent = message.content.toLowerCase();

  // Check if the message starts with the correct prefix and split the content
  if (message.content.startsWith('x')) {
    const args = message.content.slice(1).trim().split(' ');
    const command = args[0]?.toLowerCase();  // Get the command name

    if (commands[command]) {
      // Call the appropriate function from the 'commands' object
      commands[command](message);
    } else {
      // Respond with "unknown" if the command doesn't exist
      commands.unknown(message);
    }
  }
  if (message.mentions.has('1010936448851124254')) {
    await message.channel.sendTyping();
    setTimeout(async () => {
      const msg = await message.channel.send('yaru? avana? avan sombari bro avan reply pana late agum . irukia da dai?');
      await msg.react('😁');
    }, 1000);
  }

  if (message.mentions.has('846323385884868669')) {
    await message.channel.sendTyping();
    setTimeout(async () => {
      const msg = await message.channel.send('Sir Sir Avan Pithiyam Sir , Vena Sir  Vera Yarachu Parugua Sir. irukia da dai?');
      await msg.react('😁');
    }, 1000);
  }

  if (message.mentions.has('1113535399013388359')) {
    await message.channel.sendTyping();
    setTimeout(async () => {
      const msg = await message.channel.send('ivaru content creator bro varamatru avru busy man. irukia da dai?');
      await msg.react('😁');
    }, 1000);
  }
  // Convert to lowercase for keyword matching
  const msg = message.content.toLowerCase();

  // Check if message includes any keywords
  if (keywords.some(keyword => msg.includes(keyword))) {
      const embed = new EmbedBuilder()
          .setColor('#be00be')
          .setTitle('Server Access Guide 🚀')
          .setDescription(responseMessage)
          .setFooter({ text: 'Please follow the instructions carefully. 💡' });

      // Typing indicator
      await message.channel.sendTyping();
      setTimeout(() => {
          message.channel.send({ embeds: [embed] });
      }, 1200); // 1.2 sec delay
  }
  if (message.author.bot) return;

  // If the bot is mentioned
  if (message.mentions.has(client.user)) {
    const userId = message.author.id;

    // Get current tag count or default to 0
    const currentCount = taggedUsers.get(userId) || 0;
    const newCount = currentCount + 1;
    taggedUsers.set(userId, newCount);

    if (message.mentions.has(client.user)) {
      const userId = message.author.id;
      const currentCount = taggedUsers.get(userId) || 0;
      const newCount = currentCount + 1;
      taggedUsers.set(userId, newCount);
      if (newCount === 1) {
        await message.reply('unaku ena venum enna ya nodura  😐');
      } else if (newCount === 2) {
        await message.reply('kadiku poi bottle vangi kuduchi sethuru, nalla bottle ha vangiko 😡💥');
      } else if (newCount === 3) {
        await message.reply(`<@1010936448851124254> ivana tag adichu kollu 😤`);
      } else if (newCount === 4) {
        await message.reply('podhum da dei ipdi tag pannatha, ennada kadaika pothu unaku? 😠');
      } else if (newCount >= 5) {
        await message.reply('vesa bottle ha poi vangi kudi');
    }}
  }
  if (containsBannedWord(message.content)) {
    const badwordsChannel = await client.channels.fetch(BANNED_WORDS_CHANNEL_ID);
    if (!badwordsChannel || badwordsChannel.type !== ChannelType.GuildText) return;

    // Delete the message
    try {
      await message.delete();
    } catch (err) {
      console.error(`❌ Failed to delete message from ${message.author.tag}:`, err);
    }

    let timeoutSuccess = true;

    // Try to timeout
    try {
      await message.member.timeout(60 * 60 * 1000, 'Used banned words');
    } catch (err) {
      timeoutSuccess = false;
      console.warn(`⚠️ Could not timeout ${message.author.tag}. Probably due to role hierarchy.`);
    }

    // Log the incident
    await badwordsChannel.send({
      content: `**__Banned Word Detected__**\n **User**: <@${message.author.id}>\n**Message**: \`${message.content}\`\n **Message was deleted.**
  ${timeoutSuccess ? '⏱️ User was timed out for 1 hour.' : ' Could not timeout the user due to role hierarchy or permissions.'}`
    });
  }  
  if (message.channel.id !== CHANNEL_IC_NAME) return;

  const content = message.content.trim();
  if (!content.includes('_')) return;

  const parts = content.split('_');
  let reason = '';

  if (parts.length !== 2) {
      reason = 'Name must contain exactly one underscore.';
  } else if (parts[0].length < 3 || parts[1].length < 3) {
      reason = 'Each part must have at least 3 letters.';
  } else if (parts[0][0] !== parts[0][0].toUpperCase() || parts[1][0] !== parts[1][0].toUpperCase()) {
      reason = 'Each part must start with a capital letter.';
  }

  if (reason) {
      await message.react('❌');

      // Send rejection message to Whitelist Queries
      const wlChannel = await client.channels.fetch(CHANNEL_WHITELIST_QUERIES);
      if (wlChannel && wlChannel.isTextBased()) {
          await wlChannel.send(`**Submission Rejected:** ${reason}\n<@${message.author.id}> submitted: \`${content}\``);
      }
  } else {
      await message.react('⏳');

      const acceptButton = new ButtonBuilder()
          .setCustomId('accept_' + message.id)
          .setLabel('✅ Accept')
          .setStyle(ButtonStyle.Success);

      const declineButton = new ButtonBuilder()
          .setCustomId('decline_' + message.id)
          .setLabel('❌ Decline')
          .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder()
          .addComponents(acceptButton, declineButton);

      const destChannel = await client.channels.fetch(CHANNEL_IC_REGISTER);

      if (destChannel && destChannel.isTextBased()) {
          const sent = await destChannel.send({
              content: `New IC Name Submitted: **${content}** by <@${message.author.id}>`,
              components: [row]
          });

          messageLinkMap.set(sent.id, message.id);
      }
  }
});


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user, message: buttonMessage } = interaction;
  const [action, originalMessageId] = customId.split('_');

  // Defer the interaction first to avoid Unknown interaction error
  await interaction.deferUpdate();

  // Check if the user has the required role
  const member = await interaction.guild.members.fetch(user.id);
  if (!member.roles.cache.has(XT_TEAM_ROLE)) {
      await interaction.followUp({ content: '❌ You are not authorized to perform this action.', flags: 64 });
      return;
  }

  // Fetch the channel where the messages are posted
  const icNameChannel = await client.channels.fetch(CHANNEL_IC_NAME);
  if (!icNameChannel || !icNameChannel.isTextBased()) return;

  try {
      const originalMessage = await icNameChannel.messages.fetch(originalMessageId);

      // Handle action based on the button clicked
      if (action === 'accept') {
          // React with custom :done: emoji and log acceptance
          await originalMessage.react('<:done:emojiID_here>'); // Replace with custom emoji ID
          await icNameChannel.send(`✅ **Submission accepted by**: <@${user.id}>`);
      } else if (action === 'decline') {
          // React with decline emoji
          await originalMessage.react('❌');
      }

      // Remove sandglass reaction ⏳ if present
      const sandglassReaction = originalMessage.reactions.cache.find(r => r.emoji.name === '⏳');
      if (sandglassReaction) {
          await sandglassReaction.users.remove(client.user.id).catch(() => {});
      }

      // Disable the buttons after the action is completed
      const disabledRow = new ActionRowBuilder()
          .addComponents(
              new ButtonBuilder()
                  .setCustomId('accept_disabled')
                  .setLabel('✅ Accepted')
                  .setStyle(ButtonStyle.Primary) // Formal style: Primary button
                  .setDisabled(true),
              new ButtonBuilder()
                  .setCustomId('decline_disabled')
                  .setLabel('❌ Declined')
                  .setStyle(ButtonStyle.Secondary) // Formal style: Secondary button
                  .setDisabled(true)
          );

      // Update the original message with the new buttons
      await buttonMessage.edit({ components: [disabledRow] });

      // Send confirmation feedback to the user who clicked the button
      await interaction.followUp({ content: `You have **${action === 'accept' ? 'accepted' : 'declined'}** the submission.`, flags: 64 });

      // (Optional) You can log the action to the console for debugging
      console.log(`✅ ${user.tag} has ${action}ed the submission.`);
      
  } catch (err) {
      console.error('Error handling button interaction:', err);
      await interaction.followUp({ content: '⚠️ There was an error processing your request. Please try again.', flags: 64 });
  }
});
