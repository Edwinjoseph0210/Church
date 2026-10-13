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
  ];

  const members: Member[] = [];
  const families: Family[] = [];

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
  const events: ParishEvent[] = [];
  const gallery_albums: GalleryAlbum[] = [
    {
      id: 'ALB-DEFAULT-1',
      title: 'Parish Liturgical & Feast Gallery',
      description: 'Official parish photos of Holy Qurbana, festivals, and community events.',
      category: 'General',
      coverImageUrl: '/images/holy_qurbana_altar_1790490159004.jpg',
      aspectRatio: 'landscape',
      isPublic: true,
      isPublished: true,
      createdAt: now,
    },
  ];

  const gallery_images: GalleryImage[] = [];

  const documents: ParishDocument[] = [];
  const organizations: Organization[] = [];
  const organization_members: OrganizationMember[] = [];
  const sacramental_records: SacramentalRecord[] = [];
  const prayer_requests: PrayerRequest[] = [];
  const appointment_requests: AppointmentRequest[] = [];
  const notifications: NotificationItem[] = [];
  const contact_messages: ContactMessage[] = [];
  const audit_logs: AuditLog[] = [];

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
        let needsSave = false;

        if (!Array.isArray(parsed.gallery_albums) || parsed.gallery_albums.length === 0) { parsed.gallery_albums = initial.gallery_albums; needsSave = true; }
        if (!Array.isArray(parsed.gallery_images)) { parsed.gallery_images = []; needsSave = true; }
        if (!Array.isArray(parsed.users)) { parsed.users = initial.users; needsSave = true; }
        if (!Array.isArray(parsed.members)) { parsed.members = initial.members; needsSave = true; }
        if (!Array.isArray(parsed.families)) { parsed.families = initial.families; needsSave = true; }
        if (!Array.isArray(parsed.holy_qurbana_timings)) { parsed.holy_qurbana_timings = initial.holy_qurbana_timings; needsSave = true; }
        if (!Array.isArray(parsed.announcements)) { parsed.announcements = initial.announcements; needsSave = true; }
        if (!Array.isArray(parsed.events)) { parsed.events = initial.events; needsSave = true; }
        if (!Array.isArray(parsed.documents)) { parsed.documents = initial.documents; needsSave = true; }
        if (!Array.isArray(parsed.organizations)) { parsed.organizations = initial.organizations; needsSave = true; }
        if (!Array.isArray(parsed.organization_members)) { parsed.organization_members = initial.organization_members; needsSave = true; }
        if (!Array.isArray(parsed.sacramental_records)) { parsed.sacramental_records = initial.sacramental_records; needsSave = true; }
        if (!Array.isArray(parsed.prayer_requests)) { parsed.prayer_requests = initial.prayer_requests; needsSave = true; }
        if (!Array.isArray(parsed.appointment_requests)) { parsed.appointment_requests = initial.appointment_requests; needsSave = true; }
        if (!Array.isArray(parsed.notifications)) { parsed.notifications = initial.notifications; needsSave = true; }
        if (!Array.isArray(parsed.contact_messages)) { parsed.contact_messages = initial.contact_messages; needsSave = true; }
        if (!Array.isArray(parsed.audit_logs)) { parsed.audit_logs = initial.audit_logs; needsSave = true; }

        // Ensure church location details and priest details are updated from official records
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
  public set gallery_images(imgs: GalleryImage[]) {
    this.data.gallery_images = imgs;
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
