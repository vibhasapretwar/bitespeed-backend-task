import type { Request, Response } from "express";
import Contact from "../models/Contact.js";

export const identify = async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        message: "Either email or phoneNumber must be provided",
      });
    }

    // Find matching contacts
    const matchedContacts = await Contact.find({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
      deletedAt: null,
    });

    // If no contacts → create new primary
    if (matchedContacts.length === 0) {
      const newContact = await Contact.create({
        id: Date.now(),
        email,
        phoneNumber,
        linkPrecedence: "primary",
      });

      return res.status(200).json({
        contact: {
          primaryContatctId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // Collect all related IDs
    const relatedIds = new Set<number>();

    matchedContacts.forEach((c) => {
      relatedIds.add(c.id);
      if (c.linkedId) relatedIds.add(c.linkedId);
    });

    const allContacts = await Contact.find({
      $or: [
        { id: { $in: Array.from(relatedIds) } },
        { linkedId: { $in: Array.from(relatedIds) } },
      ],
      deletedAt: null,
    });

    // Find oldest contact → PRIMARY
    const primary = allContacts.reduce((oldest, current) =>
      current.createdAt < oldest.createdAt ? current : oldest
    );

    // Convert others to secondary if needed
    for (const contact of allContacts) {
      if (contact.id !== primary.id) {
        if (contact.linkPrecedence !== "secondary") {
          contact.linkPrecedence = "secondary";
          contact.linkedId = primary.id;
          await contact.save();
        }
      }
    }

    // Check if new data needs to be inserted
    const emailExists = allContacts.some((c) => c.email === email);
    const phoneExists = allContacts.some(
      (c) => c.phoneNumber === phoneNumber
    );

    if (!emailExists || !phoneExists) {
      const newSecondary = await Contact.create({
        id: Date.now(),
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId: primary.id,
      });

      allContacts.push(newSecondary);
    }

    // Re-fetch updated contacts
    const finalContacts = await Contact.find({
      $or: [{ id: primary.id }, { linkedId: primary.id }],
      deletedAt: null,
    });

    const primaryContact = finalContacts.find(
      (c) => c.linkPrecedence === "primary"
    )!;

    const secondaryContacts = finalContacts.filter(
      (c) => c.linkPrecedence === "secondary"
    );

    const emails = [
      primaryContact.email,
      ...secondaryContacts.map((c) => c.email),
    ].filter(Boolean) as string[];

    const phoneNumbers = [
      primaryContact.phoneNumber,
      ...secondaryContacts.map((c) => c.phoneNumber),
    ].filter(Boolean) as string[];

    const secondaryContactIds = secondaryContacts.map((c) => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: [...new Set(emails)],
        phoneNumbers: [...new Set(phoneNumbers)],
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};