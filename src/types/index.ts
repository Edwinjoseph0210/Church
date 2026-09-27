export type UserRole =
  | 'MEMBER'
  | 'PRIEST'
  | 'PARISH_MEMBER'
  | 'SUPER_ADMIN'
  | 'PARISH_ADMIN'
  | 'ORGANIZATION_COORDINATOR';

export type UserStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ACTIVE'
  | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  memberId?: string;
  passwordHash: string;
  role: UserRole;
  assignedOrganizationId?: string;
  name: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface Member {
  id: string; // e.g. "DEMO-001" or "M-101"
  userId?: string;
  familyId?: string;
  relationshipToHead: 'HEAD' | 'SPOUSE' | 'CHILD' | 'PARENT' | 'OTHER' | string;
  relationshipWithHead?: string; // Display string e.g. "Family Head", "Wife", "Son", "Daughter"
  fullName?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  address: string;
  houseName: string;
  occupation: string;
  profession?: string; // Alias matching physical register column
  profilePhoto?: string;
  membershipStatus: 'ACTIVE' | 'INACTIVE';
  // Diocese of Hosur Physical Register Sacramental Columns
  baptismDate?: string;
  baptismParish?: string;
  firstCommunionConfirmationDate?: string;
  firstHolyCommunionDate?: string; // Physical register column
  confirmationDate?: string; // Physical register column
  marriageDate?: string;
  marriageParish?: string;
  marriageOrdinationDate?: string; // Physical register column
  marriageOrdinationDetails?: string;
  ordinationOrProfessionDate?: string;
  deathInfo?: string; // Physical register column
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'RELIGIOUS' | 'DIVORCED';
  education?: string;
  bloodGroup?: string;
  currentResidenceStatus?: 'RESIDING_WITH_FAMILY' | 'WORKING_ABROAD' | 'WORKING_OTHER_CITY' | 'STUDYING_AWAY' | 'DECEASED';
  dateOfDeath?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FamilyRegisterStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Priest Review'
  | 'Approved'
  | 'Changes Requested'
  | 'VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'DRAFT'
  | 'CHANGE_REQUESTED';

export interface Family {
  id: string; // e.g. "FAM-001"
  familyNumber?: string; // Physical register Family Number
  headOfFamilyName?: string; // Name of Head of Family
  familyName: string; // Family Name
  familyUnitName?: string; // Family Unit Name
  houseName: string;
  wardOrUnit?: string;
  contactPhone: string;
  mobileNumber?: string;
  landline?: string;
  contactEmail: string;
  headMemberId?: string;
  // Address fields entered by the member for their own family residence
  address: string;
  doorNumber?: string;
  street?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  wardNumber?: string;
  // Diocese of Hosur Register Fields
  transferredParish?: string;
  transferDate?: string;
  parishTransferRegisterNumber?: string;
  dioceseInKerala?: string;
  monthlySubscription?: string | number;
  churchTradition?: 'Syro Malabar' | 'Latin' | 'Syro Malankara' | 'Others' | string;
  diocese?: string;
  nativeParish?: string;
  nativeDiocese?: string;
  houseOwnership?: 'OWNED' | 'RENTED' | 'CHURCH_QUARTERS' | 'FAMILY_ANCESTRAL' | 'OTHER';
  verificationStatus?: FamilyRegisterStatus;
  registerStatus?: FamilyRegisterStatus;
  verifiedDate?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  priestReviewNotes?: string;
  changeRequestReason?: string;
  changeRequestDate?: string;
  registerFolioNumber?: string;
  createdAt: string;
  updatedAt: string;
  members?: Member[];
}

export interface HolyQurbanaTiming {
  id: string;
  dayType: 'SUNDAY' | 'WEEKDAY' | 'SPECIAL' | 'FEAST';
  dayName: string;
  time: string; // e.g. "[HOLY QURBANA TIMINGS]" or "07:00 AM"
  language: string;
  description?: string;
  notes?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: 'GENERAL' | 'LITURGY' | 'YOUTH' | 'CATECHISM' | 'CHARITY' | 'FEAST';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  isImportant: boolean;
  publishDate: string;
  expiryDate?: string;
  author: string;
  audience: 'PUBLIC' | 'MEMBERS' | 'SPECIFIC_ORGANIZATION';
  organizationId?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'EXPIRED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ParishEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl?: string;
  organizer: string;
  organizationId?: string;
  registrationInfo?: string;
  contactInfo: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImageUrl: string;
  isPublic: boolean;
  isPublished: boolean;
  createdAt: string;
  imageCount?: number;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  albumId: string;
  imageUrl: string;
  caption: string;
  order: number;
  createdAt: string;
}

export interface ParishDocument {
  id: string;
  title: string;
  description: string;
  category: 'PARISH_NOTICE' | 'FORM' | 'CATECHISM' | 'MEETING_MINUTES' | 'SACRAMENTAL_GUIDE' | 'FINANCIAL';
  fileName: string;
  fileSize: string;
  fileUrl: string;
  fileContent?: string; // base64 or stored text for secure downloads
  uploadedBy: string;
  uploadDate: string;
  visibility: 'PUBLIC' | 'MEMBERS_ONLY' | 'ADMIN_ONLY' | 'ORGANIZATION_ONLY';
  organizationId?: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  coordinatorName: string;
  coordinatorUserId?: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  meetingSchedule: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  memberId: string;
  memberName: string;
  role: 'COORDINATOR' | 'ASSISTANT' | 'SECRETARY' | 'TREASURER' | 'MEMBER';
  joinedDate: string;
}

export interface SacramentalRecord {
  id: string;
  type: 'BAPTISM' | 'CONFIRMATION' | 'MARRIAGE' | 'FUNERAL';
  recordNumber: string;
  personName: string;
  memberId?: string;
  dateOfEvent: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  parents?: string;
  godparentsOrSponsor?: string;
  groomName?: string;
  brideName?: string;
  witnesses?: string;
  church: string;
  priest: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  requestText: string;
  category: 'HEALTH' | 'FAMILY' | 'DECEASED' | 'THANKSGIVING' | 'VOCATION' | 'SPECIAL_INTENTION';
  isPrivate: boolean;
  status: 'NEW' | 'REVIEWED' | 'COMPLETED' | 'ARCHIVED';
  priestNotes?: string;
  createdAt: string;
}

export interface AppointmentRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  preferredDate: string;
  preferredTime: string;
  reason: 'CONFESSION' | 'SPIRITUAL_DIRECTION' | 'FAMILY_BLESSING' | 'HOUSE_VISIT' | 'MARRIAGE_CONSULTATION' | 'GENERAL';
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED';
  priestResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId?: string; // null = broadcast to all parish members
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'EVENT' | 'APPOINTMENT' | 'PRAYER' | 'DOCUMENT' | 'GENERAL';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  timestamp: string;
}

export interface ParishSettings {
  churchName: string;
  tradition: string;
  diocese: string;
  parishPriest: string;
  parishPriestPhone?: string;
  parishPriestPhoto?: string;
  assistantPriests: string;
  address: string;
  phone: string;
  email: string;
  officeHours: string;
  website: string;
  socialLinks: {
    facebook: string;
    youtube: string;
    instagram: string;
  };
  heroTagline: string;
  heroImageUrl: string;
  altarImageUrl: string;
  communityImageUrl: string;
  aboutHistory: string;
  missionStatement: string;
  visionStatement: string;
}
