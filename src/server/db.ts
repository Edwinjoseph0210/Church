import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Member,
  Family,
  HolyQurbanaTiming,
  Announcement,
  ParishEvent,
  GalleryAlbum,
  GalleryImage,
  ParishDocument,
  Organization,
  OrganizationMember,
  SacramentalRecord,
  PrayerRequest,
  AppointmentRequest,
  NotificationItem,
  ContactMessage,
  AuditLog,
  ParishSettings,
} from '../types';

interface DatabaseSchema {
  users: User[];
  members: Member[];
  families: Family[];
  holy_qurbana_timings: HolyQurbanaTiming[];
  announcements: Announcement[];
  events: ParishEvent[];
  gallery_albums: GalleryAlbum[];
  gallery_images: GalleryImage[];
  documents: ParishDocument[];
  organizations: Organization[];
  organization_members: OrganizationMember[];
  sacramental_records: SacramentalRecord[];
  prayer_requests: PrayerRequest[];
  appointment_requests: AppointmentRequest[];
  notifications: NotificationItem[];
  contact_messages: ContactMessage[];
  audit_logs: AuditLog[];
  parish_settings: ParishSettings;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'parish_db.json');

// Initial Default Settings with updated official church details
const defaultSettings: ParishSettings = {
  churchName: 'St. Mariam Thresia Syro-Malabar Catholic Church',
  tradition: 'Syro-Malabar Catholic Church',
  diocese: 'Diocese of Hosur',
  parishPriest: 'Fr. Joshy N George',
  assistantPriests: 'Msgr. Varghese Pereppadan',
  address: '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002',
  phone: '+91 97421 62172',
  email: 'stmariamthresiaparish@gmail.com',
  officeHours: 'Monday - Saturday: 9:00 AM - 1:00 PM, 4:00 PM - 7:00 PM',
  website: 'https://stmariamthresia.church',
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
  },
  heroTagline: 'United in Faith. Growing in Love. Serving Together.',
  heroImageUrl: '/images/holy_qurbana_altar_1790490159004.jpg',
  altarImageUrl: '/images/holy_qurbana_altar_1790490159004.jpg',
  communityImageUrl: '/images/parish_community_gathering_1790490173737.jpg',
  aboutHistory: '[PARISH HISTORY TO BE ADDED]',
  missionStatement:
    'To proclaim the Gospel of Jesus Christ in the venerable Syro-Malabar liturgical tradition, fostering authentic Christian community, compassionate service to families, and the sanctity of domestic church life inspired by Saint Mariam Thresia.',
  visionStatement:
    'A vibrant, prayerful, and caring Catholic parish community rooted in Eucharistic faith, committed to uplifting the needy, nurturing youth, and walking together in holy unity.',
};

function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: 'USR-PRIEST',
      email: 'priest@church.org',
      name: 'Fr. Joshy N George',
      role: 'PRIEST',
      status: 'APPROVED',
      phone: '+91 97421 62172',
      passwordHash: bcrypt.hashSync('priest123', salt),
      createdAt: now,
    },
    {
      id: 'USR-MEMBER-1',
      email: 'demo.member@church.org',
      memberId: 'DEMO-001',
      name: 'John Demo',
      phone: '+91 88071 88445',
      role: 'MEMBER',
      status: 'APPROVED',
      passwordHash: bcrypt.hashSync('member123', salt),
      createdAt: now,
    },
    {
      id: 'USR-MEMBER-2',
      email: 'mary.demo@church.org',
      memberId: 'DEMO-002',
      name: 'Mary Demo',
      phone: '+91 88071 88446',
      role: 'MEMBER',
      status: 'APPROVED',
      passwordHash: bcrypt.hashSync('member123', salt),
      createdAt: now,
    },
    {
      id: 'USR-MEMBER-OTHER',
      email: 'other.member@church.org',
      memberId: 'DEMO-010',
      name: 'Thomas Demo',
      phone: '+91 88071 88447',
      role: 'MEMBER',
      status: 'APPROVED',
      passwordHash: bcrypt.hashSync('member123', salt),
      createdAt: now,
    },
    {
      id: 'USR-PENDING-JOSEPH',
      email: 'joseph.pc@example.com',
      name: 'Joseph P.C.',
      phone: '+91 98401 23456',
      role: 'MEMBER',
      status: 'PENDING',
      passwordHash: bcrypt.hashSync('member123', salt),
      createdAt: now,
    },
  ];

  const families: Family[] = [
    {
      id: 'FAM-001',
      familyNumber: '101/A',
      headOfFamilyName: 'John Demo',
      familyName: 'Demo Family (Palackal)',
      familyUnitName: 'St. Thomas Unit 1',
      houseName: 'Bethlehem House',
      wardOrUnit: 'St. Thomas Unit 1',
      wardNumber: 'Ward 4',
      contactPhone: '+91 88071 88445',
      mobileNumber: '+91 88071 88445',
      landline: '044-27428844',
      contactEmail: 'demo.member@church.org',
      headMemberId: 'DEMO-001',
      address: '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002',
      doorNumber: '9, 1E',
      street: 'GST Road',
      area: 'J C K Nagar',
      city: 'Chengalpattu',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      pinCode: '603002',
      transferredParish: 'St. Mary Forane Church, Kuravilangad',
      transferDate: '2018-05-12',
      parishTransferRegisterNumber: 'TR-KVL-89/18',
      dioceseInKerala: 'Eparchy of Palai',
      monthlySubscription: '₹500',
      churchTradition: 'Syro Malabar',
      diocese: 'Diocese of Hosur',
      nativeParish: 'St. Mary Forane Church, Kuravilangad',
      nativeDiocese: 'Eparchy of Palai',
      houseOwnership: 'OWNED',
      verificationStatus: 'Approved',
      registerStatus: 'Approved',
      registerFolioNumber: 'REG-HSR-2024/042',
      verifiedDate: '2024-01-15',
      verifiedBy: 'Vicar, St. Mariam Thresia Church',
      verificationNotes: 'Official parish register record verified against baptismal certificates and Diocese census records.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'FAM-002',
      familyNumber: '102/B',
      headOfFamilyName: 'Thomas Demo',
      familyName: 'Second Demo Family (Kizhakkethalackal)',
      familyUnitName: 'St. Alphonsa Unit 3',
      houseName: 'Nazareth Villa',
      wardOrUnit: 'St. Alphonsa Unit 3',
      wardNumber: 'Ward 2',
      contactPhone: '+91 88071 88447',
      mobileNumber: '+91 88071 88447',
      landline: '044-27429999',
      contactEmail: 'other.member@church.org',
      headMemberId: 'DEMO-010',
      address: '42, Alagesan Nagar, Chengalpattu, Tamil Nadu 603001',
      doorNumber: '42',
      street: 'Alagesan Nagar Main Rd',
      area: 'Alagesan Nagar',
      city: 'Chengalpattu',
      district: 'Chengalpattu',
      state: 'Tamil Nadu',
      pinCode: '603001',
      transferredParish: 'St. Joseph Church, Ramapuram',
      transferDate: '2020-08-20',
      parishTransferRegisterNumber: 'TR-RMP-45/20',
      dioceseInKerala: 'Eparchy of Palai',
      monthlySubscription: '₹350',
      churchTradition: 'Syro Malabar',
      diocese: 'Diocese of Hosur',
      nativeParish: 'St. Joseph Church, Ramapuram',
      nativeDiocese: 'Eparchy of Palai',
      houseOwnership: 'RENTED',
      verificationStatus: 'Under Priest Review',
      registerStatus: 'Under Priest Review',
      registerFolioNumber: 'REG-HSR-2024/043',
      verificationNotes: 'Submitted by Head of Family for annual parish register verification.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const members: Member[] = [
    {
      id: 'DEMO-001',
      userId: 'USR-MEMBER-1',
      familyId: 'FAM-001',
      relationshipToHead: 'HEAD',
      firstName: 'John',
      lastName: 'Demo',
      dateOfBirth: '1985-04-12',
      gender: 'MALE',
      phone: '+91 88071 88445',
      email: 'demo.member@church.org',
      address: '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002',
      houseName: 'Bethlehem House',
      occupation: 'Senior Software Engineer',
      education: 'B.Tech in Computer Science',
      bloodGroup: 'O+',
      baptismDate: '1985-05-10',
      baptismParish: 'St. Mary Forane Church, Kuravilangad',
      firstCommunionConfirmationDate: '1995-04-20',
      marriageDate: '2012-09-08',
      marriageParish: 'St. Thomas Church, Pala',
      maritalStatus: 'MARRIED',
      currentResidenceStatus: 'RESIDING_WITH_FAMILY',
      membershipStatus: 'ACTIVE',
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'DEMO-002',
      userId: 'USR-MEMBER-2',
      familyId: 'FAM-001',
      relationshipToHead: 'SPOUSE',
      firstName: 'Mary',
      lastName: 'Demo',
      dateOfBirth: '1988-08-23',
      gender: 'FEMALE',
      phone: '+91 88071 88446',
      email: 'mary.demo@church.org',
      address: '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002',
      houseName: 'Bethlehem House',
      occupation: 'Healthcare Educator & Nurse Specialist',
      education: 'M.Sc Nursing',
      bloodGroup: 'B+',
      baptismDate: '1988-09-18',
      baptismParish: 'St. George Church, Arakkunnam',
      firstCommunionConfirmationDate: '1998-05-14',
      marriageDate: '2012-09-08',
      marriageParish: 'St. Thomas Church, Pala',
      maritalStatus: 'MARRIED',
      currentResidenceStatus: 'RESIDING_WITH_FAMILY',
      membershipStatus: 'ACTIVE',
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'DEMO-003',
      familyId: 'FAM-001',
      relationshipToHead: 'CHILD',
      firstName: 'Joseph',
      lastName: 'Demo',
      dateOfBirth: '2015-02-14',
      gender: 'MALE',
      phone: '+91 88071 88445',
      email: 'joseph.demo@church.org',
      address: '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002',
      houseName: 'Bethlehem House',
      occupation: 'Catechism Student (Class 5)',
      education: 'Primary School (5th Grade)',
      bloodGroup: 'O+',
      baptismDate: '2015-03-22',
      baptismParish: 'St. Mariam Thresia Church, Chengalpattu',
      firstCommunionConfirmationDate: '2023-01-08',
      maritalStatus: 'SINGLE',
      currentResidenceStatus: 'RESIDING_WITH_FAMILY',
      membershipStatus: 'ACTIVE',
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'DEMO-010',
      userId: 'USR-MEMBER-OTHER',
      familyId: 'FAM-002',
      relationshipToHead: 'HEAD',
      firstName: 'Thomas',
      lastName: 'Demo',
      dateOfBirth: '1979-11-05',
      gender: 'MALE',
      phone: '+91 88071 88445',
      email: 'other.member@church.org',
      address: '42, Alagesan Nagar, Chengalpattu, Tamil Nadu 603001',
      houseName: 'Nazareth Villa',
      occupation: 'Chartered Accountant',
      education: 'M.Com, FCA',
      bloodGroup: 'A+',
      baptismDate: '1979-12-02',
      baptismParish: 'St. Joseph Church, Ramapuram',
      firstCommunionConfirmationDate: '1989-05-07',
      marriageDate: '2008-01-14',
      marriageParish: 'St. Mary Church, Bharananganam',
      maritalStatus: 'MARRIED',
      currentResidenceStatus: 'RESIDING_WITH_FAMILY',
      membershipStatus: 'ACTIVE',
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const holy_qurbana_timings: HolyQurbanaTiming[] = [
    {
      id: 'HQ-1',
      dayType: 'SUNDAY',
      dayName: 'Sunday Holy Qurbana',
      time: '8:00 AM',
      language: 'Malayalam & English (Syro-Malabar)',
      description: 'Solemn Sunday Holy Qurbana preceded by Morning Prayer (Sapra)',
      notes: 'Catechism classes and choir fellowship follow the Holy Qurbana',
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 'HQ-2',
      dayType: 'WEEKDAY',
      dayName: 'Monday to Thursday',
      time: '6:00 AM',
      language: 'Malayalam',
      description: 'Daily Morning Holy Qurbana & Sapra',
      notes: 'Adoration in the Blessed Sacrament Chapel',
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 'HQ-3',
      dayType: 'WEEKDAY',
      dayName: 'Friday and Saturday',
      time: 'Evening 8:00 PM',
      language: 'Malayalam',
      description: 'Evening Holy Qurbana, Sacred Heart Devotion & Novena',
      notes: 'Friday Eucharistic Adoration and Saturday Novena of Our Lady of Perpetual Help',
      isActive: true,
      displayOrder: 3,
    },
  ];

  const announcements: Announcement[] = [];

  const events: ParishEvent[] = [
    {
      id: 'EVT-1',
      title: 'Solemn Holy Qurbana & Eucharistic Adoration',
      description:
        'Parish community gathered in thanksgiving, prayer for sick members, and solemn blessing in the Syro-Malabar liturgical tradition.',
      date: '2026-10-04',
      startTime: '09:00 AM',
      endTime: '11:30 AM',
      location: 'Main Church Sanctuary',
      imageUrl: '/images/holy_qurbana_altar_1790490159004.jpg',
      organizer: 'Liturgical Committee',
      contactInfo: '[PARISH OFFICE CONTACT]',
      status: 'UPCOMING',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'EVT-2',
      title: 'Youth Ministry Faith Formation Workshop',
      description:
        'Interactive seminar on living Christian values in modern university and professional life, fellowship activities, and praise & worship.',
      date: '2026-10-10',
      startTime: '02:00 PM',
      endTime: '05:30 PM',
      location: 'Parish Community Hall',
      imageUrl: '/images/parish_community_gathering_1790490173737.jpg',
      organizer: 'St. Mariam Thresia Youth Movement',
      registrationInfo: 'RSVP via Youth Coordinator',
      contactInfo: 'youth@church.org',
      status: 'UPCOMING',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'EVT-3',
      title: 'Family Units Rosary & Bible Study Night',
      description:
        'Parish-wide Scripture reflection focused on Saint Paul’s letters and the spiritual charism of family sanctity.',
      date: '2026-10-16',
      startTime: '07:00 PM',
      endTime: '08:30 PM',
      location: 'St. Joseph Conference Hall',
      organizer: 'Family Life Apostolate',
      contactInfo: '[PARISH OFFICE CONTACT]',
      status: 'UPCOMING',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const gallery_albums: GalleryAlbum[] = [
    {
      id: 'ALB-1',
      title: 'Parish Patronal Celebrations & Rassa',
      description: 'Dignified photographs of our patronal feast liturgical procession, choral worship, and prayer gathering.',
      category: 'Parish Feast',
      coverImageUrl: '/images/hero_church_facade_1790490137085.jpg',
      isPublic: true,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'ALB-2',
      title: 'Sanctuary Liturgy & Holy Qurbana',
      description: 'Reverent moments at the holy altar during Solemn Raza celebrations.',
      category: 'Liturgy',
      coverImageUrl: '/images/holy_qurbana_altar_1790490159004.jpg',
      isPublic: true,
      isPublished: true,
      createdAt: now,
    },
    {
      id: 'ALB-3',
      title: 'Parish Family Fellowship & Community Day',
      description: 'Moments of joy, community meals, and multigenerational parish life.',
      category: 'Community Activities',
      coverImageUrl: '/images/parish_community_gathering_1790490173737.jpg',
      isPublic: true,
      isPublished: true,
      createdAt: now,
    },
  ];

  const gallery_images: GalleryImage[] = [
    {
      id: 'IMG-1',
      albumId: 'ALB-1',
      imageUrl: '/images/hero_church_facade_1790490137085.jpg',
      caption: 'St. Mariam Thresia Church exterior illuminated for evening services.',
      order: 1,
      createdAt: now,
    },
    {
      id: 'IMG-2',
      albumId: 'ALB-2',
      imageUrl: '/images/holy_qurbana_altar_1790490159004.jpg',
      caption: 'The altar adorned for solemn Syro-Malabar Qurbana.',
      order: 1,
      createdAt: now,
    },
    {
      id: 'IMG-3',
      albumId: 'ALB-3',
      imageUrl: '/images/parish_community_gathering_1790490173737.jpg',
      caption: 'Parish families gathered for fellowship and fraternal love.',
      order: 1,
      createdAt: now,
    },
  ];

  const documents: ParishDocument[] = [
    {
      id: 'DOC-1',
      title: 'Catechism Enrollment Form (Academic Year)',
      description: 'Standard registration and parent consent form for Sunday Catechetical school.',
      category: 'FORM',
      fileName: 'catechism_enrollment_form.pdf',
      fileSize: '340 KB',
      fileUrl: '/api/documents/DOC-1/download',
      uploadedBy: '[PARISH OFFICE ADMIN]',
      uploadDate: '2026-09-10',
      visibility: 'PUBLIC',
      status: 'ACTIVE',
    },
    {
      id: 'DOC-2',
      title: 'Syro-Malabar Holy Qurbana Liturgical Participation Guide',
      description: 'Hymns, prayers, and responses for congregation during Solemn Raza.',
      category: 'SACRAMENTAL_GUIDE',
      fileName: 'holy_qurbana_congregation_guide.pdf',
      fileSize: '1.2 MB',
      fileUrl: '/api/documents/DOC-2/download',
      uploadedBy: 'Liturgical Commission',
      uploadDate: '2026-09-12',
      visibility: 'PUBLIC',
      status: 'ACTIVE',
    },
    {
      id: 'DOC-3',
      title: 'Parish General Body Meeting Minutes & Financial Review',
      description: 'Confidential summary of trustee accounts and building development deliberations.',
      category: 'MEETING_MINUTES',
      fileName: 'general_body_q3_minutes.pdf',
      fileSize: '780 KB',
      fileUrl: '/api/documents/DOC-3/download',
      uploadedBy: 'Parish Trustee Admin',
      uploadDate: '2026-09-24',
      visibility: 'MEMBERS_ONLY',
      status: 'ACTIVE',
    },
  ];

  const organizations: Organization[] = [
    {
      id: 'ORG-CATECHISM',
      name: 'Sunday Catechism Department',
      slug: 'catechism',
      description: 'Faith formation, sacramental preparation, and spiritual development for children and teenagers.',
      coordinatorName: 'Director of Catechesis',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: '[EMAIL ADDRESS]',
      meetingSchedule: 'Every Sunday prior to Morning Holy Qurbana',
      createdAt: now,
    },
    {
      id: 'ORG-YOUTH',
      name: 'St. Mariam Thresia Youth Movement (SMYM)',
      slug: 'youth',
      description: 'Active fellowship for youth and young adults, organizing retreats, community service, and cultural programs.',
      coordinatorName: 'Youth Coordinator',
      coordinatorUserId: 'USR-YOUTH-COORD',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: 'youth@church.org',
      meetingSchedule: 'Second and Fourth Saturdays at 5:00 PM',
      createdAt: now,
    },
    {
      id: 'ORG-CHOIR',
      name: 'Parish Liturgical Choir',
      slug: 'choir',
      description: 'Leading the congregation in traditional Syro-Malabar sacred hymns and chants during Holy Qurbana.',
      coordinatorName: 'Choir Director',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: '[EMAIL ADDRESS]',
      meetingSchedule: 'Friday evenings at 6:30 PM',
      createdAt: now,
    },
    {
      id: 'ORG-ALTAR',
      name: 'Altar Servers Guild',
      slug: 'altar-servers',
      description: 'Training boys and girls in reverent service around the Holy Sanctuary during the divine mysteries.',
      coordinatorName: 'Altar Guild Master',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: '[EMAIL ADDRESS]',
      meetingSchedule: 'First Saturday of every month',
      createdAt: now,
    },
    {
      id: 'ORG-FAMILY-UNITS',
      name: 'Family Units (Kudumba Kootayma)',
      slug: 'family-units',
      description: 'Neighborhood prayer units fostering close Christian fellowship, prayer, and mutual care among families.',
      coordinatorName: 'Family Apostolate Coordinator',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: '[EMAIL ADDRESS]',
      meetingSchedule: 'Monthly unit gatherings at member residences',
      createdAt: now,
    },
    {
      id: 'ORG-MATHRUVEDI',
      name: 'Mathruvedi (Women’s Association)',
      slug: 'mathruvedi',
      description: 'Empowering women in family prayer life, church service, charitable outreach, and spiritual retreats.',
      coordinatorName: 'Mathruvedi President',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: '[EMAIL ADDRESS]',
      meetingSchedule: 'Third Sunday of every month',
      createdAt: now,
    },
    {
      id: 'ORG-PITHRUVEEDI',
      name: 'Pithruvedi (Men’s Association)',
      slug: 'pithruvedi',
      description: 'Guiding fathers and men of the parish in spiritual leadership, community building, and parish logistics.',
      coordinatorName: 'Pithruvedi President',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: '[EMAIL ADDRESS]',
      meetingSchedule: 'Last Sunday of every month',
      createdAt: now,
    },
    {
      id: 'ORG-CHARITY',
      name: 'St. Vincent de Paul Charity Apostolate',
      slug: 'charity',
      description: 'Dedicated to helping underprivileged families, medical relief, and compassionate outreach.',
      coordinatorName: 'Charity Coordinator',
      coordinatorPhone: '+91 88071 88445',
      coordinatorEmail: '[EMAIL ADDRESS]',
      meetingSchedule: 'Bi-weekly on Sundays',
      createdAt: now,
    },
  ];

  const organization_members: OrganizationMember[] = [
    {
      id: 'OM-1',
      organizationId: 'ORG-YOUTH',
      memberId: 'DEMO-001',
      memberName: 'John Demo',
      role: 'MEMBER',
      joinedDate: '2025-01-10',
    },
    {
      id: 'OM-2',
      organizationId: 'ORG-MATHRUVEDI',
      memberId: 'DEMO-002',
      memberName: 'Mary Demo',
      role: 'SECRETARY',
      joinedDate: '2024-05-14',
    },
  ];

  const sacramental_records: SacramentalRecord[] = [
    {
      id: 'SAC-1',
      type: 'BAPTISM',
      recordNumber: 'BAP-2025-042',
      personName: 'Joseph Demo',
      memberId: 'DEMO-003',
      dateOfEvent: '2015-03-25',
      dateOfBirth: '2015-02-14',
      parents: 'John Demo & Mary Demo',
      godparentsOrSponsor: 'George Demo & Teresa Joseph',
      church: 'St. Mariam Thresia Church',
      priest: 'Fr. Joshy N George',
      notes: 'Anointed with Holy Chrism and received first Holy Communion.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'SAC-2',
      type: 'MARRIAGE',
      recordNumber: 'MAR-2014-018',
      personName: 'John Demo & Mary Demo',
      dateOfEvent: '2014-01-18',
      groomName: 'John Demo',
      brideName: 'Mary Demo',
      witnesses: 'Paul Demo & Clara Thomas',
      church: 'St. Mariam Thresia Church',
      priest: 'Fr. Joshy N George',
      notes: 'Holy Matrimony celebrated in the presence of parish community.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const prayer_requests: PrayerRequest[] = [
    {
      id: 'PR-1',
      memberId: 'DEMO-001',
      memberName: 'John Demo',
      memberEmail: 'demo.member@church.org',
      requestText: 'Kindly pray for my elderly mother undergoing cataract surgery next Wednesday.',
      category: 'HEALTH',
      isPrivate: false,
      status: 'REVIEWED',
      priestNotes: 'Included in the Intentions for Friday Holy Qurbana.',
      createdAt: now,
    },
  ];

  const appointment_requests: AppointmentRequest[] = [
    {
      id: 'APT-1',
      memberId: 'DEMO-001',
      memberName: 'John Demo',
      memberPhone: '+1 (555) 019-2831',
      memberEmail: 'demo.member@church.org',
      preferredDate: '2026-10-08',
      preferredTime: '04:30 PM',
      reason: 'FAMILY_BLESSING',
      message: 'Requesting father to visit and bless our newly renovated family home.',
      status: 'APPROVED',
      priestResponse: 'Confirmed. I will visit on Oct 8 at 4:30 PM. God bless your family.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'NOTIF-PRIEST-REG-1',
      recipientUserId: 'USR-PRIEST',
      title: 'New Parish Member Registration',
      message: 'Joseph P.C. has requested access to the parish member portal.',
      type: 'GENERAL',
      link: '/priest/dashboard',
      isRead: false,
      createdAt: now,
    },
    {
      id: 'NOTIF-2',
      title: 'Feast of St. Mariam Thresia Notice',
      message: 'The solemn parish feast schedule and volunteer sign-ups have been published.',
      type: 'ANNOUNCEMENT',
      link: '/announcements',
      isRead: false,
      createdAt: now,
    },
  ];

  const contact_messages: ContactMessage[] = [
    {
      id: 'CNT-1',
      name: 'Visitor Demo',
      email: 'visitor@example.com',
      phone: '+1 (555) 000-1122',
      subject: 'Inquiry regarding Holy Qurbana timings for visitors',
      message: 'Hello Father, my family will be visiting next month. What are the English Mass timings on Sunday?',
      status: 'NEW',
      createdAt: now,
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'AUD-1',
      userId: 'USR-SUPER',
      userName: 'Super Administrator',
      userRole: 'SUPER_ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      resource: 'SYSTEM',
      details: 'Parish database initialized with Syro-Malabar liturgical configuration.',
      timestamp: now,
    },
  ];

  return {
    users,
    members,
    families,
    holy_qurbana_timings,
    announcements,
    events,
    gallery_albums,
    gallery_images,
    documents,
    organizations,
    organization_members,
    sacramental_records,
    prayer_requests,
    appointment_requests,
    notifications,
    contact_messages,
    audit_logs,
    parish_settings: defaultSettings,
  };
}

class ParishDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    const initial = getInitialDatabase();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Ensure church location details and priest details are updated from official records
        let needsSave = false;
        if (!parsed.parish_settings || parsed.parish_settings.diocese === '[DIOCESE NAME]' || parsed.parish_settings.address === '[CHURCH ADDRESS]') {
          parsed.parish_settings = {
            ...defaultSettings,
            ...parsed.parish_settings,
            churchName: 'St. Mariam Thresia Syro-Malabar Catholic Church',
            diocese: 'Diocese of Hosur',
            parishPriest: 'Fr. Joshy N George',
            address: '9, 1E, GST Road, J C K Nagar, Chengalpattu, Tamil Nadu 603002',
            phone: '+91 97421 62172',
            email: 'stmariamthresiaparish@gmail.com',
          };
          needsSave = true;
        } else {
          if (!parsed.parish_settings.parishPriest || parsed.parish_settings.parishPriest === '[PARISH PRIEST NAME]') {
            parsed.parish_settings.parishPriest = 'Fr. Joshy N George';
            needsSave = true;
          }
          if (!parsed.parish_settings.assistantPriests || parsed.parish_settings.assistantPriests === '[ASSISTANT PRIEST NAME]') {
            parsed.parish_settings.assistantPriests = 'Msgr. Varghese Pereppadan';
            needsSave = true;
          }
          if (!parsed.parish_settings.phone || parsed.parish_settings.phone === '+91 88071 88445') {
            parsed.parish_settings.phone = '+91 97421 62172';
            needsSave = true;
          }
        }

        // Ensure users are normalized to strictly TWO roles: PRIEST and MEMBER
        if (parsed.users && parsed.users.length > 0) {
          parsed.users.forEach((u) => {
            if (u.role === 'SUPER_ADMIN' || u.role === 'PARISH_ADMIN') {
              u.role = 'PRIEST';
              needsSave = true;
            } else if (u.role === 'PARISH_MEMBER' || u.role === 'ORGANIZATION_COORDINATOR') {
              u.role = 'MEMBER';
              needsSave = true;
            }
            if ((u.status as string) === 'ACTIVE') {
              u.status = 'APPROVED';
              needsSave = true;
            }
            if (u.role === 'PRIEST' || u.id === 'USR-PRIEST') {
              if (u.name === '[PARISH PRIEST NAME]' || !u.name) {
                u.name = 'Fr. Joshy N George';
                needsSave = true;
              }
              if (u.phone !== '+91 97421 62172') {
                u.phone = '+91 97421 62172';
                needsSave = true;
              }
            }
          });

          // Ensure demo pending user Joseph P.C. exists for testing
          if (!parsed.users.some((u) => u.email === 'joseph.pc@example.com')) {
            const pendingJoseph = initial.users.find((u) => u.email === 'joseph.pc@example.com');
            if (pendingJoseph) {
              parsed.users.push(pendingJoseph);
              needsSave = true;
            }
          }
        }

        // Ensure Priest notification for pending registrations exists
        if (parsed.notifications && !parsed.notifications.some((n) => n.id === 'NOTIF-PRIEST-REG-1')) {
          const priestNotif = initial.notifications.find((n) => n.id === 'NOTIF-PRIEST-REG-1');
          if (priestNotif) {
            parsed.notifications.unshift(priestNotif);
            needsSave = true;
          }
        }

        // Ensure families have Hosur register metadata
        if (parsed.families && parsed.families.length > 0) {
          parsed.families.forEach((fam) => {
            const initFam = initial.families.find((f) => f.id === fam.id);
            if (initFam) {
              if (!fam.familyNumber) { fam.familyNumber = initFam.familyNumber; needsSave = true; }
              if (!fam.headOfFamilyName) { fam.headOfFamilyName = initFam.headOfFamilyName; needsSave = true; }
              if (!fam.familyUnitName) { fam.familyUnitName = initFam.familyUnitName; needsSave = true; }
              if (!fam.wardNumber) { fam.wardNumber = initFam.wardNumber; needsSave = true; }
              if (!fam.doorNumber) { fam.doorNumber = initFam.doorNumber; needsSave = true; }
              if (!fam.street) { fam.street = initFam.street; needsSave = true; }
              if (!fam.area) { fam.area = initFam.area; needsSave = true; }
              if (!fam.city) { fam.city = initFam.city; needsSave = true; }
              if (!fam.district) { fam.district = initFam.district; needsSave = true; }
              if (!fam.state) { fam.state = initFam.state; needsSave = true; }
              if (!fam.pinCode) { fam.pinCode = initFam.pinCode; needsSave = true; }
              if (!fam.churchTradition) { fam.churchTradition = initFam.churchTradition; needsSave = true; }
              if (!fam.monthlySubscription) { fam.monthlySubscription = initFam.monthlySubscription; needsSave = true; }
              if (!fam.diocese) { fam.diocese = initFam.diocese; needsSave = true; }
              if (!fam.verificationStatus) { fam.verificationStatus = initFam.verificationStatus; needsSave = true; }
              if (!fam.registerStatus) { fam.registerStatus = initFam.registerStatus; needsSave = true; }
              if (!fam.nativeParish) { fam.nativeParish = initFam.nativeParish; needsSave = true; }
              if (!fam.nativeDiocese) { fam.nativeDiocese = initFam.nativeDiocese; needsSave = true; }
              if (!fam.houseOwnership) { fam.houseOwnership = initFam.houseOwnership; needsSave = true; }
              if (!fam.registerFolioNumber) { fam.registerFolioNumber = initFam.registerFolioNumber; needsSave = true; }
              if (!fam.verifiedDate && initFam.verifiedDate) { fam.verifiedDate = initFam.verifiedDate; needsSave = true; }
              if (!fam.verifiedBy && initFam.verifiedBy) { fam.verifiedBy = initFam.verifiedBy; needsSave = true; }
              if (!fam.verificationNotes && initFam.verificationNotes) { fam.verificationNotes = initFam.verificationNotes; needsSave = true; }
            }
          });
        }

        // Ensure members have register sacraments
        if (parsed.members && parsed.members.length > 0) {
          parsed.members.forEach((mem) => {
            const initMem = initial.members.find((m) => m.id === mem.id);
            if (initMem) {
              if (!mem.baptismDate && initMem.baptismDate) { mem.baptismDate = initMem.baptismDate; needsSave = true; }
              if (!mem.baptismParish && initMem.baptismParish) { mem.baptismParish = initMem.baptismParish; needsSave = true; }
              if (!mem.firstCommunionConfirmationDate && initMem.firstCommunionConfirmationDate) { mem.firstCommunionConfirmationDate = initMem.firstCommunionConfirmationDate; needsSave = true; }
              if (!mem.marriageDate && initMem.marriageDate) { mem.marriageDate = initMem.marriageDate; needsSave = true; }
              if (!mem.marriageParish && initMem.marriageParish) { mem.marriageParish = initMem.marriageParish; needsSave = true; }
              if (!mem.maritalStatus && initMem.maritalStatus) { mem.maritalStatus = initMem.maritalStatus; needsSave = true; }
              if (!mem.education && initMem.education) { mem.education = initMem.education; needsSave = true; }
              if (!mem.bloodGroup && initMem.bloodGroup) { mem.bloodGroup = initMem.bloodGroup; needsSave = true; }
              if (!mem.currentResidenceStatus && initMem.currentResidenceStatus) { mem.currentResidenceStatus = initMem.currentResidenceStatus; needsSave = true; }
              if (mem.isVerified === undefined && initMem.isVerified !== undefined) { mem.isVerified = initMem.isVerified; needsSave = true; }
            }
          });
        }

        // Ensure audit logs, sacramental records, and families replace placeholder priest name
        if (parsed.audit_logs && parsed.audit_logs.length > 0) {
          parsed.audit_logs.forEach((log) => {
            if (log.userName === '[PARISH PRIEST NAME]') {
              log.userName = 'Fr. Joshy N George';
              needsSave = true;
            }
          });
        }
        if (parsed.sacramental_records && parsed.sacramental_records.length > 0) {
          parsed.sacramental_records.forEach((s) => {
            if (s.priest === '[PARISH PRIEST NAME]') {
              s.priest = 'Fr. Joshy N George';
              needsSave = true;
            }
          });
        }
        if (parsed.announcements && parsed.announcements.length > 0) {
          parsed.announcements.forEach((a) => {
            if (a.author === '[PARISH PRIEST NAME]') {
              a.author = 'Fr. Joshy N George';
              needsSave = true;
            }
          });
        }
        if (parsed.families && parsed.families.length > 0) {
          parsed.families.forEach((f) => {
            if (f.verifiedBy === '[PARISH PRIEST NAME]') {
              f.verifiedBy = 'Fr. Joshy N George';
              needsSave = true;
            }
          });
        }

        if (parsed.holy_qurbana_timings) {
          const hasPlaceholder = parsed.holy_qurbana_timings.some((t: any) => t.time && t.time.includes('[HOLY QURBANA TIMINGS]'));
          if (hasPlaceholder || parsed.holy_qurbana_timings.length > 3) {
            parsed.holy_qurbana_timings = initial.holy_qurbana_timings;
            needsSave = true;
          }
        }

        if (needsSave) {
          this.saveDirect(parsed);
        }
        return parsed;
      } catch (e) {
        console.error('Error loading existing db, initializing fresh:', e);
      }
    }
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(db: DatabaseSchema) {
    this.ensureDirectory();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save() {
    this.saveDirect(this.data);
  }

  public get users() {
    return this.data.users;
  }
  public get members() {
    return this.data.members;
  }
  public get families() {
    return this.data.families;
  }
  public get holy_qurbana_timings() {
    return this.data.holy_qurbana_timings;
  }
  public get announcements() {
    return this.data.announcements;
  }
  public get events() {
    return this.data.events;
  }
  public get gallery_albums() {
    return this.data.gallery_albums;
  }
  public get gallery_images() {
    return this.data.gallery_images;
  }
  public get documents() {
    return this.data.documents;
  }
  public get organizations() {
    return this.data.organizations;
  }
  public get organization_members() {
    return this.data.organization_members;
  }
  public get sacramental_records() {
    return this.data.sacramental_records;
  }
  public get prayer_requests() {
    return this.data.prayer_requests;
  }
  public get appointment_requests() {
    return this.data.appointment_requests;
  }
  public get notifications() {
    return this.data.notifications;
  }
  public get contact_messages() {
    return this.data.contact_messages;
  }
  public get audit_logs() {
    return this.data.audit_logs;
  }
  public get parish_settings() {
    return this.data.parish_settings;
  }
  public set parish_settings(settings: ParishSettings) {
    this.data.parish_settings = settings;
    this.save();
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...log,
      timestamp: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(newLog);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.save();
  }
}

export const db = new ParishDatabase();
