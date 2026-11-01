import type {
  Organization,
  Company,
  Project,
  User,
  FinancialYear,
  PerformancePeriod,
  KRA,
  KPI,
  KPITarget,
  KPIMeasurement,
  KPIEvidence,
  ScoringSettings,
  ContractRecord,
  ComplianceObligation,
  LitigationCase,
  LegalNotice,
  LegalRisk,
  PropertyDueDiligence,
  ProjectApproval,
  LegalTransaction,
  LegalTask,
  AuditLogEntry,
  NotificationItem,
  PerformanceReview,
  KPISubmission,
} from '../types';
import {
  DEFAULT_SCORING_SETTINGS,
  calculateKPIAchievement,
  autoCalculateKPIActual,
  calculateOperationalMetrics,
} from './calculationEngine';

export interface DatabaseState {
  organizations: Organization[];
  companies: Company[];
  projects: Project[];
  users: User[];
  financialYears: FinancialYear[];
  periods: PerformancePeriod[];
  kras: KRA[];
  kpis: KPI[];
  targets: KPITarget[];
  measurements: KPIMeasurement[];
  evidence: KPIEvidence[];
  submissions: KPISubmission[];
  contracts: ContractRecord[];
  compliances: ComplianceObligation[];
  litigations: LitigationCase[];
  notices: LegalNotice[];
  risks: LegalRisk[];
  dueDiligences: PropertyDueDiligence[];
  approvals: ProjectApproval[];
  transactions: LegalTransaction[];
  tasks: LegalTask[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
  reviews: PerformanceReview[];
  scoringSettings: Record<string, ScoringSettings>; // keyed by organizationId
}

// In-Memory Normalized Enterprise Database
class MemoryDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.seedDatabase();
  }

  public getState(): DatabaseState {
    return this.state;
  }

  private seedDatabase(): DatabaseState {
    const orgId = 'org-apex-01';

    const organizations: Organization[] = [
      {
        id: orgId,
        name: 'Nyati',
        code: 'NYATI',
        industry: 'Real Estate & Urban Infrastructure Development',
        createdDate: '2025-01-10',
      },
    ];

    const companies: Company[] = [
      {
        id: 'comp-apex-core',
        organizationId: orgId,
        name: 'Nyati',
        code: 'NYATI',
        cin: 'U45200MH2008PLC183921',
        active: true,
      },
    ];

    const projects: Project[] = [
      {
        id: 'proj-skyline',
        organizationId: orgId,
        companyId: 'comp-apex-core',
        name: 'Nyati',
        code: 'ASH-01',
        location: 'Worli, Mumbai',
        reraRegistrationNumber: 'P51800028491',
        type: 'Residential',
        status: 'Under Construction',
      },
      {
        id: 'proj-grandbay',
        organizationId: orgId,
        companyId: 'comp-apex-core',
        name: 'Nyati',
        code: 'GBG-02',
        location: 'Hinjawadi Phase 3, Pune',
        reraRegistrationNumber: 'P52100031940',
        type: 'Township',
        status: 'Under Construction',
      },
      {
        id: 'proj-techpark',
        organizationId: orgId,
        companyId: 'comp-apex-core',
        name: 'Nyati',
        code: 'TPH-03',
        location: 'Whitefield, Bengaluru',
        reraRegistrationNumber: 'PRM/KA/RERA/1251/446/PR/200114/003180',
        type: 'Commercial',
        status: 'Approvals',
      },
      {
        id: 'proj-orchid',
        organizationId: orgId,
        companyId: 'comp-apex-core',
        name: 'Nyati',
        code: 'AOE-04',
        location: 'Sector 65, Gurugram',
        reraRegistrationNumber: 'RC/REP/HARERA/GGM/2021/49',
        type: 'Residential',
        status: 'Ready for Possession',
      },
    ];

    const users: User[] = [
      {
        id: 'usr-madhav',
        organizationId: orgId,
        name: 'Madhav Oak',
        email: 'madhav.oak@company.com',
        password: 'Madhavoak@123',
        role: 'LEGAL_HEAD',
        designation: 'VP CS',
        department: 'Legal',
        wing: 'Legal',
        level: 1,
        managerId: null,
        managerName: 'Board of Directors / MD',
        subordinateIds: ['usr-parul'],
        activeMatters: 0,
        slaRate: 100,
        avgTAT: '0 Days',
        status: 'ON_TRACK',
        rating: '5.0 / 5.0',
        assignedKras: ['kra-01', 'kra-02', 'kra-03', 'kra-04', 'kra-05', 'kra-06', 'kra-07', 'kra-08', 'kra-09', 'kra-10'],
        assignedKpis: ['kpi-01-01', 'kpi-01-02', 'kpi-01-03', 'kpi-02-01', 'kpi-02-02', 'kpi-02-03'],
      },
      {
        id: 'usr-parul',
        organizationId: orgId,
        name: 'Parul Tiwari',
        email: 'parul.tiwari@company.com',
        password: 'Parultiwari@123',
        role: 'LEGAL_MANAGER',
        designation: '2nd Level',
        department: 'Legal',
        wing: 'Legal',
        level: 2,
        managerId: 'usr-madhav',
        managerName: 'Madhav Oak',
        subordinateIds: [],
        activeMatters: 0,
        slaRate: 100,
        avgTAT: '0 Days',
        status: 'ON_TRACK',
        rating: '5.0 / 5.0',
        assignedKras: ['kra-01', 'kra-02', 'kra-03', 'kra-04'],
        assignedKpis: ['kpi-01-01', 'kpi-01-02', 'kpi-02-01', 'kpi-02-02', 'kpi-03-01', 'kpi-03-02', 'kpi-04-01', 'kpi-04-02'],
      },
    ];

    const financialYears: FinancialYear[] = [
      {
        id: 'fy-2026-27',
        organizationId: orgId,
        name: 'FY 2026-27',
        startDate: '2026-04-01',
        endDate: '2027-03-31',
        isCurrent: true,
      },
      {
        id: 'fy-2025-26',
        organizationId: orgId,
        name: 'FY 2025-26',
        startDate: '2025-04-01',
        endDate: '2026-03-31',
        isCurrent: false,
      },
    ];

    const periods: PerformancePeriod[] = [
      // FY 2026-27 Months
      {
        id: 'period-2026-04',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'April 2026',
        type: 'MONTHLY',
        month: 4,
        quarter: 'Q1',
        year: 2026,
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        status: 'LOCKED',
        lockedDate: '2026-05-05',
        approvedBy: 'Madhav Oak',
      },
      {
        id: 'period-2026-05',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'May 2026',
        type: 'MONTHLY',
        month: 5,
        quarter: 'Q1',
        year: 2026,
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        status: 'LOCKED',
        lockedDate: '2026-06-05',
        approvedBy: 'Madhav Oak',
      },
      {
        id: 'period-2026-06',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'June 2026',
        type: 'MONTHLY',
        month: 6,
        quarter: 'Q1',
        year: 2026,
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        status: 'LOCKED',
        lockedDate: '2026-07-05',
        approvedBy: 'Madhav Oak',
      },
      {
        id: 'period-2026-07',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'July 2026',
        type: 'MONTHLY',
        month: 7,
        quarter: 'Q2',
        year: 2026,
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        status: 'LOCKED',
        lockedDate: '2026-08-05',
        approvedBy: 'Madhav Oak',
      },
      {
        id: 'period-2026-08',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'August 2026',
        type: 'MONTHLY',
        month: 8,
        quarter: 'Q2',
        year: 2026,
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        status: 'APPROVED',
        lockedDate: '2026-09-04',
        approvedBy: 'Madhav Oak',
      },
      {
        id: 'period-2026-09',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'September 2026',
        type: 'MONTHLY',
        month: 9,
        quarter: 'Q2',
        year: 2026,
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        status: 'UNDER_REVIEW', // Current active testing period
      },
      {
        id: 'period-2026-q1',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'Q1 FY 2026-27',
        type: 'QUARTERLY',
        quarter: 'Q1',
        year: 2026,
        startDate: '2026-04-01',
        endDate: '2026-06-30',
        status: 'LOCKED',
        approvedBy: 'Madhav Oak',
      },
      {
        id: 'period-2026-q2',
        organizationId: orgId,
        financialYearId: 'fy-2026-27',
        name: 'Q2 FY 2026-27',
        type: 'QUARTERLY',
        quarter: 'Q2',
        year: 2026,
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        status: 'UNDER_REVIEW',
      },
    ];

    // The 10 Default Configurable KRAs categorized by Department and Wing
    const kras: KRA[] = [
      {
        id: 'kra-01',
        organizationId: orgId,
        kraNumber: 1,
        name: 'Land Title & Property Due Diligence Compliance',
        description:
          'Measure the effectiveness of title verification, encumbrance checks and statutory clearance of land parcels before acquisition, transaction or project launch.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 15,
        active: true,
        orderIndex: 1,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-02',
        organizationId: orgId,
        kraNumber: 2,
        name: 'Statutory & Regulatory Compliance',
        description:
          'Measure timely completion of statutory obligations tracked in the compliance register: RERA quarterly updates, ROC / MCA filings, labour and tax compliances.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 15,
        active: true,
        orderIndex: 2,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-03',
        organizationId: orgId,
        kraNumber: 3,
        name: 'Project Statutory Approvals & Licences',
        description:
          'Measure success in obtaining and keeping valid statutory approvals, NOCs and licences for projects (commencement, environment, fire and occupancy) within stipulated SLAs.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 10,
        active: true,
        orderIndex: 3,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-04',
        organizationId: orgId,
        kraNumber: 4,
        name: 'Contract & Agreement Compliance Vetting',
        description:
          'Measure turnaround and compliance quality in vetting contracts, agreements and vendor documents against statutory requirements and the company approval matrix.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 15,
        active: true,
        orderIndex: 4,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-05',
        organizationId: orgId,
        kraNumber: 5,
        name: 'Customer Documentation & RERA Agreement Compliance',
        description:
          'Measure accuracy and timeliness of customer-facing statutory documentation: allotment letters, agreements for sale, registration and RERA-mandated disclosures.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 10,
        active: true,
        orderIndex: 5,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-06',
        organizationId: orgId,
        kraNumber: 6,
        name: 'Litigation & Regulatory Proceedings Management',
        description:
          'Measure tracking of litigation and regulatory proceedings (RERA, consumer, civil, NCLT): filings within limitation, hearing preparation and containment of high-risk matters.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 15,
        active: true,
        orderIndex: 6,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-07',
        organizationId: orgId,
        kraNumber: 7,
        name: 'Statutory Notices & Regulatory Correspondence',
        description:
          'Measure timely and accurate responses to notices and requisitions from regulators and authorities (RERA, MCA / ROC, GST, income tax, municipal and labour) within SLA.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 5,
        active: true,
        orderIndex: 7,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-08',
        organizationId: orgId,
        kraNumber: 8,
        name: 'Compliance Risk Management & Governance',
        description:
          'Measure proactive identification and mitigation of compliance risks, upkeep of the compliance risk register and adherence to the compliance calendar.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 10,
        active: true,
        orderIndex: 8,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-09',
        organizationId: orgId,
        kraNumber: 9,
        name: 'Corporate Secretarial & Board Governance',
        description:
          'Measure Companies Act compliance for group entities: ROC / MCA filings, Board and general meeting processes, minutes and secretarial audit observations.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 3,
        active: true,
        orderIndex: 9,
        effectivePeriod: 'FY 2026-27',
      },
      {
        id: 'kra-10',
        organizationId: orgId,
        kraNumber: 10,
        name: 'Statutory Records, Archival & Consultant Management',
        description:
          'Measure upkeep of statutory registers and records, digital archival of compliance documents, and control over external consultant fees and deliverables.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        weight: 2,
        active: true,
        orderIndex: 10,
        effectivePeriod: 'FY 2026-27',
      },
    ];

    // 30 Specific KPIs (3 per KRA) categorized by Department and assigned to real employees
    const kpis: KPI[] = [
      // KRA 1: Land Title & Property Due Diligence Compliance
      {
        id: 'kpi-01-01',
        organizationId: orgId,
        kraId: 'kra-01',
        kpiCode: 'K1-KPI-01',
        name: 'Title Due Diligence Reports Cleared within SLA %',
        description: 'Percentage of land title searches, encumbrance certificates and mutation searches completed and cleared within SLA.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'DUE_DILIGENCE',
        weight: 40,
        targetValue: 95.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-01-02',
        organizationId: orgId,
        kraId: 'kra-01',
        kpiCode: 'K1-KPI-02',
        name: 'Title Defect & Encumbrance Resolution TAT',
        description: 'Average days taken to resolve identified title queries or documentation encumbrances.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'DURATION',
        unit: 'days',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'MANUAL',
        dataSource: 'DUE_DILIGENCE',
        weight: 30,
        targetValue: 3,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-01-03',
        organizationId: orgId,
        kraId: 'kra-01',
        kpiCode: 'K1-KPI-03',
        name: 'Properties Legally Cleared before Transaction',
        description: 'Number of land parcels or properties cleared with complete title and statutory documentation before transaction or launch.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'NUMBER',
        unit: 'properties',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'DUE_DILIGENCE',
        weight: 30,
        targetValue: 5,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 2: Statutory & Regulatory Compliance
      {
        id: 'kpi-02-01',
        organizationId: orgId,
        kraId: 'kra-02',
        kpiCode: 'K2-KPI-01',
        name: 'Statutory Compliances Completed On Time %',
        description: 'Percentage of compliance register obligations filed or completed on or before the statutory due date.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'COMPLIANCE',
        weight: 50,
        targetValue: 98.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-02-02',
        organizationId: orgId,
        kraId: 'kra-02',
        kpiCode: 'K2-KPI-02',
        name: 'Overdue Statutory Obligations',
        description: 'Number of compliance obligations past their due date and still open.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'NUMBER',
        unit: 'obligations',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'COMPLIANCE',
        weight: 30,
        targetValue: 0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-02-03',
        organizationId: orgId,
        kraId: 'kra-02',
        kpiCode: 'K2-KPI-03',
        name: 'RERA Quarterly Disclosure Filing Compliance %',
        description: 'Percentage of quarterly RERA project updates and disclosures filed within regulatory deadlines.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        dataSource: 'COMPLIANCE',
        weight: 20,
        targetValue: 100.0,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 3: Project Statutory Approvals & Licences
      {
        id: 'kpi-03-01',
        organizationId: orgId,
        kraId: 'kra-03',
        kpiCode: 'K3-KPI-01',
        name: 'Statutory Approvals & NOCs Obtained %',
        description: 'Percentage of applied project approvals, NOCs and licences obtained from the authorities.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'APPROVALS',
        weight: 40,
        targetValue: 90.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-03-02',
        organizationId: orgId,
        kraId: 'kra-03',
        kpiCode: 'K3-KPI-02',
        name: 'Pending Statutory Approvals',
        description: 'Number of project approvals and NOCs still pending with the authorities.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'NUMBER',
        unit: 'approvals',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'APPROVALS',
        weight: 30,
        targetValue: 2,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-03-03',
        organizationId: orgId,
        kraId: 'kra-03',
        kpiCode: 'K3-KPI-03',
        name: 'Authority Query Response TAT',
        description: 'Average days taken to respond to authority queries raised on approval and licence applications.',
        ownerId: 'usr-parul',
        ownerName: 'Parul Tiwari',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'DURATION',
        unit: 'days',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'MANUAL',
        dataSource: 'APPROVALS',
        weight: 30,
        targetValue: 3.0,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 4: Contract & Agreement Compliance Vetting
      {
        id: 'kpi-04-01',
        organizationId: orgId,
        kraId: 'kra-04',
        kpiCode: 'K4-KPI-01',
        name: 'Contracts Vetted within SLA %',
        description: 'Percentage of contracts and agreements vetted for compliance within the agreed SLA.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'CONTRACTS',
        weight: 40,
        targetValue: 95.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-04-02',
        organizationId: orgId,
        kraId: 'kra-04',
        kpiCode: 'K4-KPI-02',
        name: 'Average Contract Vetting TAT',
        description: 'Average days taken to complete compliance vetting of a contract or agreement.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'DURATION',
        unit: 'days',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'CONTRACTS',
        weight: 30,
        targetValue: 3.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-04-03',
        organizationId: orgId,
        kraId: 'kra-04',
        kpiCode: 'K4-KPI-03',
        name: 'Contract Compliance Checklist Adherence %',
        description: 'Percentage of executed contracts with complete stamp duty, registration and approval-matrix compliance.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        dataSource: 'CONTRACTS',
        weight: 30,
        targetValue: 98.0,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 5: Customer Documentation & RERA Agreement Compliance
      {
        id: 'kpi-05-01',
        organizationId: orgId,
        kraId: 'kra-05',
        kpiCode: 'K5-KPI-01',
        name: 'Agreements for Sale Registered within SLA %',
        description: 'Percentage of customer agreements for sale executed and registered within the committed timeline.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 40,
        targetValue: 95.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-05-02',
        organizationId: orgId,
        kraId: 'kra-05',
        kpiCode: 'K5-KPI-02',
        name: 'Customer Compliance Query Resolution TAT',
        description: 'Average days taken to resolve customer queries on statutory documentation and RERA disclosures.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'DURATION',
        unit: 'days',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 30,
        targetValue: 2.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-05-03',
        organizationId: orgId,
        kraId: 'kra-05',
        kpiCode: 'K5-KPI-03',
        name: 'Customer Documentation Error Rate %',
        description: 'Percentage of customer documents (allotment letters, agreements, deeds) needing correction after issue.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 30,
        targetValue: 1.5,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 6: Litigation & Regulatory Proceedings Management
      {
        id: 'kpi-06-01',
        organizationId: orgId,
        kraId: 'kra-06',
        kpiCode: 'K6-KPI-01',
        name: 'Litigation & Proceeding Filings within Limitation %',
        description: 'Percentage of pleadings, replies and statutory filings made within limitation or tribunal timelines.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'LITIGATION',
        weight: 40,
        targetValue: 95.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-06-02',
        organizationId: orgId,
        kraId: 'kra-06',
        kpiCode: 'K6-KPI-02',
        name: 'Hearing Preparation Completed On Time %',
        description: 'Percentage of hearings for which briefs, documents and counsel instructions were ready on time.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        dataSource: 'LITIGATION',
        weight: 30,
        targetValue: 98.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-06-03',
        organizationId: orgId,
        kraId: 'kra-06',
        kpiCode: 'K6-KPI-03',
        name: 'High-Risk Litigation Matters Open',
        description: 'Number of open litigation or regulatory proceedings rated high risk.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'NUMBER',
        unit: 'matters',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'LITIGATION',
        weight: 30,
        targetValue: 1,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 7: Statutory Notices & Regulatory Correspondence
      {
        id: 'kpi-07-01',
        organizationId: orgId,
        kraId: 'kra-07',
        kpiCode: 'K7-KPI-01',
        name: 'Notices Responded within SLA %',
        description: 'Percentage of statutory and regulatory notices answered within the response SLA.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'NOTICES',
        weight: 50,
        targetValue: 95.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-07-02',
        organizationId: orgId,
        kraId: 'kra-07',
        kpiCode: 'K7-KPI-02',
        name: 'Overdue Notice Responses',
        description: 'Number of statutory notices whose response deadline has passed without a reply.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'NUMBER',
        unit: 'notices',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'NOTICES',
        weight: 30,
        targetValue: 0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-07-03',
        organizationId: orgId,
        kraId: 'kra-07',
        kpiCode: 'K7-KPI-03',
        name: 'Average Notice Response TAT',
        description: 'Average days taken to respond to statutory and regulatory notices.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'DURATION',
        unit: 'days',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'NOTICES',
        weight: 20,
        targetValue: 3.0,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 8: Compliance Risk Management & Governance
      {
        id: 'kpi-08-01',
        organizationId: orgId,
        kraId: 'kra-08',
        kpiCode: 'K8-KPI-01',
        name: 'Open High & Critical Compliance Risks',
        description: 'Number of high or critical compliance risks open in the risk register.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'NUMBER',
        unit: 'risks',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'AUTOMATIC',
        dataSource: 'RISKS',
        weight: 40,
        targetValue: 2,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-08-02',
        organizationId: orgId,
        kraId: 'kra-08',
        kpiCode: 'K8-KPI-02',
        name: 'Risks with Active Mitigation Plans %',
        description: 'Percentage of open compliance risks with an approved, active mitigation plan.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        dataSource: 'RISKS',
        weight: 30,
        targetValue: 95.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-08-03',
        organizationId: orgId,
        kraId: 'kra-08',
        kpiCode: 'K8-KPI-03',
        name: 'Compliance Calendar Adherence %',
        description: 'Percentage of compliance calendar milestones met on schedule across the department.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        dataSource: 'RISKS',
        weight: 30,
        targetValue: 98.0,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 9: Corporate Secretarial & Board Governance
      {
        id: 'kpi-09-01',
        organizationId: orgId,
        kraId: 'kra-09',
        kpiCode: 'K9-KPI-01',
        name: 'ROC / MCA Filings within Due Date %',
        description: 'Percentage of ROC / MCA e-forms and annual filings submitted on or before the due date.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 40,
        targetValue: 90.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-09-02',
        organizationId: orgId,
        kraId: 'kra-09',
        kpiCode: 'K9-KPI-02',
        name: 'Open Secretarial Audit Observations',
        description: 'Number of secretarial audit or internal audit observations still open.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'NUMBER',
        unit: 'observations',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 30,
        targetValue: 1,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-09-03',
        organizationId: orgId,
        kraId: 'kra-09',
        kpiCode: 'K9-KPI-03',
        name: 'Board & General Meeting Minutes Finalisation TAT',
        description: 'Average days taken to finalise and sign minutes of Board, committee and general meetings.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'DURATION',
        unit: 'days',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 30,
        targetValue: 12.0,
        active: true,
        effectiveDate: '2026-04-01',
      },

      // KRA 10: Statutory Records, Archival & Consultant Management
      {
        id: 'kpi-10-01',
        organizationId: orgId,
        kraId: 'kra-10',
        kpiCode: 'K10-KPI-01',
        name: 'Professional & Consultant Fee Audit Accuracy %',
        description: 'Percentage of consultant and professional fee invoices verified against engagement terms without error.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 40,
        targetValue: 98.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-10-02',
        organizationId: orgId,
        kraId: 'kra-10',
        kpiCode: 'K10-KPI-02',
        name: 'Compliance Document Digital Archival TAT',
        description: 'Average days taken to digitally archive filed compliance documents and acknowledgements.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'DURATION',
        unit: 'days',
        frequency: 'MONTHLY',
        direction: 'LOWER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 30,
        targetValue: 2.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
      {
        id: 'kpi-10-03',
        organizationId: orgId,
        kraId: 'kra-10',
        kpiCode: 'K10-KPI-03',
        name: 'Statutory Registers Updated within Timeline %',
        description: 'Percentage of statutory registers (members, directors, charges, contracts) updated within the prescribed timeline.',
        ownerId: 'usr-madhav',
        ownerName: 'Madhav Oak',
        department: 'Legal Compliance',
        wing: 'Legal',
        measurementType: 'PERCENTAGE',
        unit: '%',
        frequency: 'MONTHLY',
        direction: 'HIGHER_IS_BETTER',
        calculationMethod: 'MANUAL',
        weight: 30,
        targetValue: 95.0,
        active: true,
        effectiveDate: '2026-04-01',
      },
    ];

    // Targets for September 2026 and previous months
    const targets: KPITarget[] = [];
    for (const kpi of kpis) {
      for (const p of periods) {
        targets.push({
          id: `target-${kpi.id}-${p.id}`,
          organizationId: orgId,
          kpiId: kpi.id,
          financialYearId: 'fy-2026-27',
          periodId: p.id,
          targetValue: kpi.targetValue,
        });
      }
    }

    // Operational Records (Realistic real estate legal operational data)
    const contracts: ContractRecord[] = [
      {
        id: 'cnt-01',
        organizationId: orgId,
        contractTitle: 'EPC Civil Construction Agreement - Tower A & B',
        contractType: 'Construction',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        counterparty: 'Larsen & Toubro Construction Ltd',
        contractValueINR: 850000000,
        receivedDate: '2026-09-02',
        reviewStartDate: '2026-09-02',
        reviewCompletedDate: '2026-09-04',
        executionDate: '2026-09-06',
        expiryDate: '2028-09-05',
        targetSLADays: 3,
        actualTATDays: 2,
        isWithinSLA: true,
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'HIGH',
        status: 'EXECUTED',
        documentRef: 'DOC-EPC-2026-09-LNT.pdf',
      },
      {
        id: 'cnt-02',
        organizationId: orgId,
        contractTitle: 'Sole Selling & Marketing Agency Agreement',
        contractType: 'Sales Agency',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        counterparty: 'Anarock Property Consultants Pvt Ltd',
        contractValueINR: 120000000,
        receivedDate: '2026-09-05',
        reviewStartDate: '2026-09-05',
        reviewCompletedDate: '2026-09-07',
        executionDate: '2026-09-08',
        expiryDate: '2027-09-07',
        targetSLADays: 3,
        actualTATDays: 2,
        isWithinSLA: true,
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'MEDIUM',
        status: 'EXECUTED',
      },
      {
        id: 'cnt-03',
        organizationId: orgId,
        contractTitle: 'Architectural & Master Planning Consultancy',
        contractType: 'Consultant',
        companyId: 'comp-apex-core',
        projectId: 'proj-orchid',
        counterparty: 'Hafeez Contractor Architects',
        contractValueINR: 45000000,
        receivedDate: '2026-09-10',
        reviewStartDate: '2026-09-10',
        reviewCompletedDate: '2026-09-14',
        targetSLADays: 3,
        actualTATDays: 4,
        isWithinSLA: false, // SLA breach by 1 day
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'LOW',
        status: 'PENDING_BUSINESS_APPROVAL',
      },
      {
        id: 'cnt-04',
        organizationId: orgId,
        contractTitle: 'High-Speed Elevators Supply & Maintenance AMC',
        contractType: 'Vendor',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        counterparty: 'Otis Elevator Company (India) Ltd',
        contractValueINR: 78000000,
        receivedDate: '2026-09-12',
        reviewStartDate: '2026-09-12',
        reviewCompletedDate: '2026-09-14',
        executionDate: '2026-09-15',
        expiryDate: '2031-09-14',
        targetSLADays: 3,
        actualTATDays: 2,
        isWithinSLA: true,
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'LOW',
        status: 'EXECUTED',
      },
      {
        id: 'cnt-05',
        organizationId: orgId,
        contractTitle: 'Commercial Anchor Tenant Master Lease Agreement (5 Floors)',
        contractType: 'Lease',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        counterparty: 'Infosys BPM Limited',
        contractValueINR: 620000000,
        receivedDate: '2026-09-15',
        reviewStartDate: '2026-09-16',
        reviewCompletedDate: '2026-09-18',
        targetSLADays: 4,
        actualTATDays: 2,
        isWithinSLA: true,
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'HIGH',
        status: 'APPROVED',
      },
      {
        id: 'cnt-06',
        organizationId: orgId,
        contractTitle: 'Structural MEP Engineering Services Contract',
        contractType: 'Consultant',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        counterparty: 'Meinhardt India Pte Ltd',
        contractValueINR: 28000000,
        receivedDate: '2026-09-18',
        reviewStartDate: '2026-09-18',
        reviewCompletedDate: '2026-09-20',
        targetSLADays: 3,
        actualTATDays: 2,
        isWithinSLA: true,
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'MEDIUM',
        status: 'APPROVED',
      },
    ];

    const compliances: ComplianceObligation[] = [
      {
        id: 'comp-01',
        organizationId: orgId,
        requirement: 'MahaRERA Q2 FY26-27 Progress Report & CA Form 3 Filing',
        regulation: 'RERA Act 2016, Sec 4(2)(l)(D)',
        authority: 'Maharashtra Real Estate Regulatory Authority',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        responsiblePersonId: 'usr-rohit',
        responsiblePersonName: 'Adv. Rohit Deshmukh',
        frequency: 'QUARTERLY',
        dueDate: '2026-10-15',
        completionDate: '2026-09-18',
        status: 'COMPLIANT',
        riskLevel: 'HIGH',
      },
      {
        id: 'comp-02',
        organizationId: orgId,
        requirement: 'MoEF Six-Monthly Environmental Clearance Monitoring Compliance',
        regulation: 'EIA Notification 2006 / EP Act 1986',
        authority: 'State Environment Impact Assessment Authority (SEIAA)',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        responsiblePersonId: 'usr-rohit',
        responsiblePersonName: 'Adv. Rohit Deshmukh',
        frequency: 'HALF_YEARLY',
        dueDate: '2026-09-30',
        completionDate: '2026-09-12',
        status: 'COMPLIANT',
        riskLevel: 'CRITICAL',
      },
      {
        id: 'comp-03',
        organizationId: orgId,
        requirement: 'Maharashtra Fire Prevention Act Annual Inspection & NOC Renewal',
        regulation: 'Maharashtra Fire Prevention & Life Safety Act 2006',
        authority: 'Chief Fire Officer, Municipal Corp of Greater Mumbai',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        responsiblePersonId: 'usr-pooja',
        responsiblePersonName: 'Pooja Kulkarni',
        frequency: 'ANNUAL',
        dueDate: '2026-09-25',
        completionDate: '2026-09-14',
        status: 'COMPLIANT',
        riskLevel: 'HIGH',
      },
      {
        id: 'comp-04',
        organizationId: orgId,
        requirement: 'Karnataka RERA Project Escrow Account Quarterly Audit Return',
        regulation: 'Karnataka Real Estate Rules, Rule 5',
        authority: 'K-RERA Bengaluru',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        responsiblePersonId: 'usr-rohit',
        responsiblePersonName: 'Adv. Rohit Deshmukh',
        frequency: 'QUARTERLY',
        dueDate: '2026-10-31',
        status: 'PENDING',
        riskLevel: 'MEDIUM',
      },
      {
        id: 'comp-05',
        organizationId: orgId,
        requirement: 'BOCW Cess (Building & Other Construction Workers Cess) Deposit Return',
        regulation: 'BOCW Welfare Cess Act 1996',
        authority: 'State Labor Welfare Board',
        companyId: 'comp-apex-core',
        projectId: 'proj-orchid',
        responsiblePersonId: 'usr-rohit',
        responsiblePersonName: 'Adv. Rohit Deshmukh',
        frequency: 'MONTHLY',
        dueDate: '2026-09-20',
        completionDate: '2026-09-19',
        status: 'COMPLIANT',
        riskLevel: 'MEDIUM',
      },
    ];

    const litigations: LitigationCase[] = [
      {
        id: 'lit-01',
        organizationId: orgId,
        caseNumber: 'WP/8942/2025',
        court: 'High Court of Judicature at Bombay',
        caseType: 'Title Challenge',
        parties: 'Kashinath Patil & Ors. vs Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        advocateOrFirm: 'Adv. Birendra Saraf / DSK Legal',
        internalOwnerId: 'usr-rohit',
        internalOwnerName: 'Adv. Rohit Deshmukh',
        filingDate: '2025-08-14',
        nextHearingDate: '2026-10-08',
        lastHearingDate: '2026-08-22',
        actionDeadline: '2026-09-28',
        caseStatus: 'HEARING_SCHEDULED',
        riskLevel: 'HIGH',
        estimatedExposureINR: 35000000,
        actualLegalCostINR: 1450000,
      },
      {
        id: 'lit-02',
        organizationId: orgId,
        caseNumber: 'MahaRERA/CC/008129/2026',
        court: 'MahaRERA Appellate Tribunal, Mumbai',
        caseType: 'RERA Dispute',
        parties: 'SkyLine Allottees Welfare Group vs Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        advocateOrFirm: 'Adv. Harish Pandya & Associates',
        internalOwnerId: 'usr-rohit',
        internalOwnerName: 'Adv. Rohit Deshmukh',
        filingDate: '2026-02-10',
        nextHearingDate: '2026-09-29',
        lastHearingDate: '2026-08-10',
        actionDeadline: '2026-09-24',
        caseStatus: 'ACTIVE',
        riskLevel: 'MEDIUM',
        estimatedExposureINR: 18000000,
        actualLegalCostINR: 520000,
      },
      {
        id: 'lit-03',
        organizationId: orgId,
        caseNumber: 'CP/IB/440/MB/2026',
        court: 'NCLT Mumbai Bench Court-I',
        caseType: 'Insolvency',
        parties: 'Sterling Precast Concrete vs Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        advocateOrFirm: 'Shardul Amarchand Mangaldas & Co',
        internalOwnerId: 'usr-rohit',
        internalOwnerName: 'Adv. Rohit Deshmukh',
        filingDate: '2026-05-19',
        nextHearingDate: '2026-10-14',
        lastHearingDate: '2026-07-28',
        caseStatus: 'ACTIVE',
        riskLevel: 'CRITICAL',
        estimatedExposureINR: 42000000,
        actualLegalCostINR: 1850000,
      },
      {
        id: 'lit-04',
        organizationId: orgId,
        caseNumber: 'CC/312/2025',
        court: 'National Consumer Disputes Redressal Commission (NCDRC), New Delhi',
        caseType: 'Consumer',
        parties: 'Col. Sanjeev Bakshi vs Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-orchid',
        advocateOrFirm: 'Adv. Praveen Agrawal',
        internalOwnerId: 'usr-rohit',
        internalOwnerName: 'Adv. Rohit Deshmukh',
        filingDate: '2025-11-04',
        nextHearingDate: '2026-11-12',
        caseStatus: 'ACTIVE',
        riskLevel: 'LOW',
        estimatedExposureINR: 4500000,
        actualLegalCostINR: 280000,
      },
    ];

    const notices: LegalNotice[] = [
      {
        id: 'not-01',
        organizationId: orgId,
        noticeType: 'Regulatory Show Cause',
        direction: 'RECEIVED',
        sender: 'Tree Authority & Municipal Commissioner, Pune Municipal Corporation',
        recipient: 'Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        dateReceived: '2026-09-04',
        responseDeadline: '2026-09-18',
        responseDate: '2026-09-12',
        targetSLADays: 7,
        actualResponseDays: 8,
        isWithinSLA: true,
        assignedLawyerId: 'usr-rohit',
        assignedLawyerName: 'Adv. Rohit Deshmukh',
        priority: 'HIGH',
        riskLevel: 'HIGH',
        status: 'RESPONDED',
      },
      {
        id: 'not-02',
        organizationId: orgId,
        noticeType: 'Contractor Claim',
        direction: 'RECEIVED',
        sender: 'Advocate for K.R. Earthmovers & Excavations LLP',
        recipient: 'Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        dateReceived: '2026-09-08',
        responseDeadline: '2026-09-22',
        responseDate: '2026-09-15',
        targetSLADays: 5,
        actualResponseDays: 4,
        isWithinSLA: true,
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        priority: 'MEDIUM',
        riskLevel: 'MEDIUM',
        status: 'RESPONDED',
      },
      {
        id: 'not-03',
        organizationId: orgId,
        noticeType: 'Customer Complaint',
        direction: 'RECEIVED',
        sender: 'Allottee Flat 1804 (Mr. Rameshwar Singhania)',
        recipient: 'Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        dateReceived: '2026-09-14',
        responseDeadline: '2026-09-24',
        responseDate: '2026-09-17',
        targetSLADays: 4,
        actualResponseDays: 3,
        isWithinSLA: true,
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        priority: 'LOW',
        riskLevel: 'LOW',
        status: 'RESPONDED',
      },
      {
        id: 'not-04',
        organizationId: orgId,
        noticeType: 'Statutory Tax',
        direction: 'RECEIVED',
        sender: 'Deputy Commissioner of State Tax (GST Intelligence Audit Unit)',
        recipient: 'Nyati',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        dateReceived: '2026-09-16',
        responseDeadline: '2026-09-30',
        targetSLADays: 7,
        assignedLawyerId: 'usr-rohit',
        assignedLawyerName: 'Adv. Rohit Deshmukh',
        priority: 'URGENT',
        riskLevel: 'HIGH',
        status: 'DRAFT_REPLY_PREPARED',
      },
    ];

    const risks: LegalRisk[] = [
      {
        id: 'rsk-01',
        organizationId: orgId,
        description: 'Disputed boundary demarcation on 4.2-acre eastern strip of Nyati Grand Bay Phase 2 parcel with adjacent village grampanchayat.',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        kraId: 'kra-01',
        riskCategory: 'Title & Land',
        probability: 3,
        impact: 5,
        riskScore: 15,
        riskLevel: 'HIGH',
        mitigationPlan: 'Commissioned Joint Demarcation Survey (JDS) with Taluka Inspector of Land Records (TILR) and executing registered boundary rectification deed.',
        ownerId: 'usr-pooja',
        ownerName: 'Pooja Kulkarni',
        mitigationDeadline: '2026-10-31',
        status: 'MITIGATION_IN_PROGRESS',
      },
      {
        id: 'rsk-02',
        organizationId: orgId,
        description: 'Delayed possession interest liability under RERA Section 18 for SkyLine Heights Tower B due to revised environmental norms.',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        kraId: 'kra-02',
        riskCategory: 'Regulatory',
        probability: 4,
        impact: 4,
        riskScore: 16,
        riskLevel: 'CRITICAL',
        mitigationPlan: 'Applied for RERA Force Majeure Extension and fast-tracked civil works with accelerated contractor incentives; pre-settling allottee handover dates.',
        ownerId: 'usr-rohit',
        ownerName: 'Adv. Rohit Deshmukh',
        mitigationDeadline: '2026-10-15',
        status: 'MITIGATION_IN_PROGRESS',
      },
      {
        id: 'rsk-03',
        organizationId: orgId,
        description: 'Vendor NCLT Section 9 insolvency petition attempt by precast concrete contractor over disputed defect deduction of ₹4.2 Cr.',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        kraId: 'kra-06',
        riskCategory: 'Litigation',
        probability: 3,
        impact: 5,
        riskScore: 15,
        riskLevel: 'HIGH',
        mitigationPlan: 'Deposited undisputed amount of ₹1.8 Cr in escrow; established pre-existing dispute under Section 9(5)(ii)(d) of IBC via prior debit notes and quality audit reports.',
        ownerId: 'usr-rohit',
        ownerName: 'Adv. Rohit Deshmukh',
        mitigationDeadline: '2026-09-30',
        status: 'MITIGATION_IN_PROGRESS',
      },
      {
        id: 'rsk-04',
        organizationId: orgId,
        description: 'Airport Authority of India height clearance restriction potentially impacting top 3 penthouse floors in Nyati.',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        kraId: 'kra-03',
        riskCategory: 'Regulatory',
        probability: 2,
        impact: 4,
        riskScore: 8,
        riskLevel: 'MEDIUM',
        mitigationPlan: 'Retained specialized aeronautical radar consultant and submitted Obstacle Limitation Surface (OLS) appeal to AAI Appellate Committee.',
        ownerId: 'usr-pooja',
        ownerName: 'Pooja Kulkarni',
        mitigationDeadline: '2026-11-30',
        status: 'OPEN',
      },
    ];

    const dueDiligences: PropertyDueDiligence[] = [
      {
        id: 'dd-01',
        organizationId: orgId,
        propertyName: 'Survey No. 142/1A & 142/2, Hinjawadi Phase 3 Extension (12.5 Acres)',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        location: 'Taluka Mulshi, District Pune',
        ownerOrSeller: 'Gaikwad Family Trust & 4 Co-parceners',
        startDate: '2026-08-01',
        completionDate: '2026-09-08',
        targetSLADays: 30,
        actualDaysTaken: 28,
        assignedLawyerId: 'usr-pooja',
        assignedLawyerName: 'Pooja Kulkarni',
        titleStatus: 'CLEAR',
        encumbranceStatus: 'NONE',
        riskLevel: 'LOW',
        defectsIdentified: 3,
        defectsResolved: 3,
        legalClearanceStatus: 'CLEARED',
      },
      {
        id: 'dd-02',
        organizationId: orgId,
        propertyName: 'Plot C-14, Whitefield Industrial-to-IT Zone (5.8 Acres)',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        location: 'KIADB Industrial Area, Bengaluru',
        ownerOrSeller: 'Zenith Electro-Mech Pvt Ltd',
        startDate: '2026-08-15',
        completionDate: '2026-09-14',
        targetSLADays: 25,
        actualDaysTaken: 22,
        assignedLawyerId: 'usr-pooja',
        assignedLawyerName: 'Pooja Kulkarni',
        titleStatus: 'CLEAR',
        encumbranceStatus: 'NONE',
        riskLevel: 'LOW',
        defectsIdentified: 2,
        defectsResolved: 2,
        legalClearanceStatus: 'CLEARED',
      },
      {
        id: 'dd-03',
        organizationId: orgId,
        propertyName: 'CTS No. 410, Lower Parel Mill Compound Redevelopment Rights (3.2 Acres)',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        location: 'Lower Parel, Mumbai',
        ownerOrSeller: 'Hindustan Weaving Mill Workers Society & Liquidator',
        startDate: '2026-09-01',
        targetSLADays: 45,
        actualDaysTaken: 20,
        assignedLawyerId: 'usr-pooja',
        assignedLawyerName: 'Pooja Kulkarni',
        titleStatus: 'UNDER_VERIFICATION',
        encumbranceStatus: 'LITIGATION_PENDING',
        riskLevel: 'HIGH',
        defectsIdentified: 4,
        defectsResolved: 2,
        legalClearanceStatus: 'CONDITIONAL_CLEARANCE',
      },
      {
        id: 'dd-04',
        organizationId: orgId,
        propertyName: 'Khasra No. 89/12, Golf Course Extension Land Parcel (8 Acres)',
        companyId: 'comp-apex-core',
        projectId: 'proj-orchid',
        location: 'Sector 65, Gurugram',
        ownerOrSeller: 'Apex Urban Farms Partnership Firm',
        startDate: '2026-08-10',
        completionDate: '2026-09-02',
        targetSLADays: 25,
        actualDaysTaken: 23,
        assignedLawyerId: 'usr-pooja',
        assignedLawyerName: 'Pooja Kulkarni',
        titleStatus: 'CLEAR',
        encumbranceStatus: 'NONE',
        riskLevel: 'LOW',
        defectsIdentified: 1,
        defectsResolved: 1,
        legalClearanceStatus: 'CLEARED',
      },
    ];

    const approvals: ProjectApproval[] = [
      {
        id: 'appr-01',
        organizationId: orgId,
        projectId: 'proj-skyline',
        companyId: 'comp-apex-core',
        approvalType: 'Commencement Certificate',
        authority: 'Municipal Corporation of Greater Mumbai (MCGM)',
        requiredDate: '2026-09-15',
        applicationDate: '2026-08-01',
        approvalDate: '2026-09-10',
        responsiblePersonId: 'usr-pooja',
        responsiblePersonName: 'Pooja Kulkarni',
        status: 'OBTAINED',
      },
      {
        id: 'appr-02',
        organizationId: orgId,
        projectId: 'proj-grandbay',
        companyId: 'comp-apex-core',
        approvalType: 'Environmental Clearance',
        authority: 'State Environment Impact Assessment Authority (SEIAA)',
        requiredDate: '2026-09-20',
        applicationDate: '2026-07-15',
        approvalDate: '2026-09-14',
        responsiblePersonId: 'usr-pooja',
        responsiblePersonName: 'Pooja Kulkarni',
        status: 'OBTAINED',
      },
      {
        id: 'appr-03',
        organizationId: orgId,
        projectId: 'proj-techpark',
        companyId: 'comp-apex-core',
        approvalType: 'Height/AAI Clearance',
        authority: 'Airports Authority of India (AAI)',
        requiredDate: '2026-10-15',
        applicationDate: '2026-08-20',
        responsiblePersonId: 'usr-pooja',
        responsiblePersonName: 'Pooja Kulkarni',
        status: 'QUERY_RAISED',
        delayReason: 'Radar interference simulation report requested by Regional Aeronautical Officer',
      },
      {
        id: 'appr-04',
        organizationId: orgId,
        projectId: 'proj-orchid',
        companyId: 'comp-apex-core',
        approvalType: 'Occupancy Certificate',
        authority: 'DTCP Haryana / HRERA Gurugram',
        requiredDate: '2026-09-28',
        applicationDate: '2026-08-10',
        approvalDate: '2026-09-18',
        responsiblePersonId: 'usr-pooja',
        responsiblePersonName: 'Pooja Kulkarni',
        status: 'OBTAINED',
      },
      {
        id: 'appr-05',
        organizationId: orgId,
        projectId: 'proj-skyline',
        companyId: 'comp-apex-core',
        approvalType: 'Fire NOC',
        authority: 'Chief Fire Officer Mumbai Fire Brigade',
        requiredDate: '2026-09-30',
        applicationDate: '2026-08-25',
        approvalDate: '2026-09-16',
        responsiblePersonId: 'usr-pooja',
        responsiblePersonName: 'Pooja Kulkarni',
        status: 'OBTAINED',
      },
    ];

    const transactions: LegalTransaction[] = [
      {
        id: 'txn-01',
        organizationId: orgId,
        transactionTitle: 'Joint Development Agreement (JDA) - 18-Acre Hinjawadi Parcel',
        transactionType: 'Joint Development Agreement',
        companyId: 'comp-apex-core',
        projectId: 'proj-grandbay',
        counterparty: 'Gaikwad Land Holdings & Agritech LLP',
        transactionValueINR: 2400000000,
        startDate: '2026-08-01',
        targetCompletionDate: '2026-09-15',
        actualCompletionDate: '2026-09-12',
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'MEDIUM',
        status: 'COMPLETED',
      },
      {
        id: 'txn-02',
        organizationId: orgId,
        transactionTitle: 'Slum Rehabilitation Legal Transfer & TDR Ingestion (80,000 sq.ft)',
        transactionType: 'Development Rights Purchase',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        counterparty: 'Sunrise Urban Infrastructure Corp',
        transactionValueINR: 950000000,
        startDate: '2026-08-20',
        targetCompletionDate: '2026-09-25',
        assignedLawyerId: 'usr-ananya',
        assignedLawyerName: 'Ananya Sharma',
        riskLevel: 'HIGH',
        status: 'STAMPING_REGISTRATION',
      },
    ];

    const tasks: LegalTask[] = [
      {
        id: 'tsk-01',
        organizationId: orgId,
        taskTitle: 'Draft Rejoinder Affidavit in Bombay HC Writ Petition 8942/2025',
        description: 'Incorporate revenue survey records, 1965 sanad, and rejoinder against petitioner fraudulent claim.',
        kraId: 'kra-06',
        kpiId: 'kpi-06-02',
        legalMatter: 'Kashinath Patil vs Nyati',
        assignedEmployeeId: 'usr-rohit',
        assignedEmployeeName: 'Adv. Rohit Deshmukh',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        priority: 'HIGH',
        startDate: '2026-09-02',
        dueDate: '2026-09-08',
        completedDate: '2026-09-07',
        targetSLADays: 6,
        actualDaysTaken: 5,
        status: 'COMPLETED',
      },
      {
        id: 'tsk-02',
        organizationId: orgId,
        taskTitle: 'Conduct 30-Year Sub-Registrar Search for Lower Parel Redevelopment',
        description: 'Verify deed registers at Old Custom House Mumbai for missing 1994 release deed.',
        kraId: 'kra-01',
        kpiId: 'kpi-01-01',
        legalMatter: 'CTS No. 410 Mill Compound Due Diligence',
        assignedEmployeeId: 'usr-pooja',
        assignedEmployeeName: 'Pooja Kulkarni',
        companyId: 'comp-apex-core',
        projectId: 'proj-skyline',
        priority: 'HIGH',
        startDate: '2026-09-05',
        dueDate: '2026-09-15',
        completedDate: '2026-09-14',
        targetSLADays: 10,
        actualDaysTaken: 9,
        status: 'COMPLETED',
      },
      {
        id: 'tsk-03',
        organizationId: orgId,
        taskTitle: 'Review & Finalize Infosys BPM Master Lease Indemnity Schedule',
        description: 'Negotiate limitation of liability cap at 12 months gross rent; carve out willful misconduct.',
        kraId: 'kra-04',
        kpiId: 'kpi-04-01',
        legalMatter: 'Nyati Tech Park Lease Agreement',
        assignedEmployeeId: 'usr-ananya',
        assignedEmployeeName: 'Ananya Sharma',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        priority: 'URGENT',
        startDate: '2026-09-15',
        dueDate: '2026-09-18',
        completedDate: '2026-09-17',
        targetSLADays: 3,
        actualDaysTaken: 2,
        status: 'COMPLETED',
      },
      {
        id: 'tsk-04',
        organizationId: orgId,
        taskTitle: 'Draft reply to GST Show Cause Notice on TDR Input Tax Credit',
        description: 'Consult Senior Counsel V. Sridharan and prepare factual submission on reverse charge liability.',
        kraId: 'kra-07',
        kpiId: 'kpi-07-01',
        legalMatter: 'GST Intelligence Audit Notice',
        assignedEmployeeId: 'usr-rohit',
        assignedEmployeeName: 'Adv. Rohit Deshmukh',
        companyId: 'comp-apex-core',
        projectId: 'proj-techpark',
        priority: 'URGENT',
        startDate: '2026-09-17',
        dueDate: '2026-09-24',
        targetSLADays: 7,
        status: 'IN_PROGRESS',
      },
    ];

    // Compute operational metrics for the current period
    const opMetrics = calculateOperationalMetrics(
      contracts,
      compliances,
      litigations,
      notices,
      risks,
      dueDiligences,
      approvals,
      tasks
    );

    // Initial KPI measurements for current period (September 2026) and previous period (August 2026)
    const measurements: KPIMeasurement[] = [];

    // Helper to generate measurement
    const addMeasurement = (
      kpi: KPI,
      periodId: string,
      actual: number,
      approvalStatus: any = 'APPROVED',
      isOverridden: boolean = false,
      calculatedAuto: boolean = true
    ) => {
      const calc = calculateKPIAchievement(kpi, actual, kpi.targetValue, DEFAULT_SCORING_SETTINGS);
      measurements.push({
        id: `msr-${kpi.id}-${periodId}`,
        organizationId: orgId,
        kpiId: kpi.id,
        periodId,
        target: kpi.targetValue,
        actual,
        achievement: calc.achievement,
        weightedScore: calc.weightedScore,
        status: calc.status,
        approvalStatus,
        calculatedAutomatically: calculatedAuto,
        isManuallyOverridden: isOverridden,
        submittedBy: 'usr-ananya',
        submittedDate: '2026-09-19',
        approvedBy: approvalStatus === 'APPROVED' ? 'usr-vikram' : undefined,
        approvedDate: approvalStatus === 'APPROVED' ? '2026-09-20' : undefined,
      });
    };

    // Realistic measurements for September 2026 (Under Review / Current)
    for (const kpi of kpis) {
      let actualVal = autoCalculateKPIActual(kpi.kpiCode, opMetrics);
      if (actualVal === null) {
        // Fallback realistic values close to target
        if (kpi.direction === 'HIGHER_IS_BETTER') {
          actualVal = Math.round(kpi.targetValue * (0.92 + Math.random() * 0.08) * 10) / 10;
        } else if (kpi.direction === 'LOWER_IS_BETTER') {
          actualVal = Math.max(0, Math.round(kpi.targetValue * (0.85 + Math.random() * 0.25) * 10) / 10);
        } else {
          actualVal = kpi.targetValue;
        }
      }

      // Sep 2026 (Active period, Under Review)
      addMeasurement(kpi, 'period-2026-09', actualVal, 'UNDER_REVIEW', false, kpi.calculationMethod === 'AUTOMATIC');

      // August 2026 (Previous period, Locked/Approved)
      const augActual =
        kpi.direction === 'HIGHER_IS_BETTER'
          ? Math.round(actualVal * 0.96 * 10) / 10
          : Math.round(actualVal * 1.05 * 10) / 10;
      addMeasurement(kpi, 'period-2026-08', augActual, 'APPROVED', false, kpi.calculationMethod === 'AUTOMATIC');

      // Historical Q1 / July 2026
      const julActual =
        kpi.direction === 'HIGHER_IS_BETTER'
          ? Math.round(actualVal * 0.94 * 10) / 10
          : Math.round(actualVal * 1.08 * 10) / 10;
      addMeasurement(kpi, 'period-2026-07', julActual, 'APPROVED', false, kpi.calculationMethod === 'AUTOMATIC');
      addMeasurement(kpi, 'period-2026-06', julActual, 'APPROVED', false, kpi.calculationMethod === 'AUTOMATIC');
      addMeasurement(kpi, 'period-2026-05', julActual, 'APPROVED', false, kpi.calculationMethod === 'AUTOMATIC');
      addMeasurement(kpi, 'period-2026-04', julActual, 'APPROVED', false, kpi.calculationMethod === 'AUTOMATIC');
    }

    const evidence: KPIEvidence[] = [
      {
        id: 'ev-01',
        organizationId: orgId,
        measurementId: 'msr-kpi-04-01-period-2026-09',
        kpiId: 'kpi-04-01',
        periodId: 'period-2026-09',
        fileName: 'Nyati_Contracts_September_2026_Audit_Register.pdf',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        uploadedBy: 'Ananya Sharma',
        uploadedDate: '2026-09-19',
        description: 'Vetted contract log signed off by Procurement Head with timestamps demonstrating 92.5% SLA completion.',
        documentUrl: 'https://docs.nyati.internal/legal/audit/Sep26-Contracts-SLA.pdf',
      },
      {
        id: 'ev-02',
        organizationId: orgId,
        measurementId: 'msr-kpi-02-01-period-2026-09',
        kpiId: 'kpi-02-01',
        periodId: 'period-2026-09',
        fileName: 'MahaRERA_Q2_Filing_Acknowledgement_Receipts.pdf',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        uploadedBy: 'Adv. Rohit Deshmukh',
        uploadedDate: '2026-09-18',
        description: 'Official MahaRERA portal filing receipts for SkyLine Heights and Grand Bay Greens projects.',
        documentUrl: 'https://docs.nyati.internal/legal/rera/Q2-FY26-Receipts.pdf',
      },
      {
        id: 'ev-03',
        organizationId: orgId,
        measurementId: 'msr-kpi-01-01-period-2026-09',
        kpiId: 'kpi-01-01',
        periodId: 'period-2026-09',
        fileName: 'Title_Search_Certification_Hinajwadi_Phase3.xlsx',
        fileType: 'EXCEL',
        fileSize: '840 KB',
        uploadedBy: 'Pooja Kulkarni',
        uploadedDate: '2026-09-16',
        description: 'Title clearance certificate with 30-year search summary and mutation certificate extracts.',
      },
    ];

    const auditLogs: AuditLogEntry[] = [
      {
        id: 'aud-01',
        organizationId: orgId,
        userId: 'usr-madhav',
        userName: 'Madhav Oak',
        userRole: 'LEGAL_HEAD',
        timestamp: '2026-09-01 09:30:00',
        action: 'INITIALIZE_FRAMEWORK',
        entity: 'KRA_FRAMEWORK',
        newValue: '10 Compliance Department KRAs configured with weights totaling 100%',
        reason: 'Annual FY 2026-27 KRA Framework Configuration',
      },
      {
        id: 'aud-02',
        organizationId: orgId,
        userId: 'usr-madhav',
        userName: 'Madhav Oak',
        userRole: 'LEGAL_HEAD',
        timestamp: '2026-09-04 18:45:00',
        action: 'APPROVE_MEASUREMENT',
        entity: 'PERFORMANCE_PERIOD',
        entityId: 'period-2026-08',
        oldValue: 'SUBMITTED',
        newValue: 'APPROVED',
        reason: 'Monthly performance review concluded with department score 91.8%',
      },
      {
        id: 'aud-03',
        organizationId: orgId,
        userId: 'usr-parul',
        userName: 'Parul Tiwari',
        userRole: 'LEGAL_MANAGER',
        timestamp: '2026-09-19 14:12:00',
        action: 'SUBMIT_MEASUREMENTS',
        entity: 'PERFORMANCE_PERIOD',
        entityId: 'period-2026-09',
        oldValue: 'DRAFT',
        newValue: 'UNDER_REVIEW',
        reason: 'September 2026 actuals submitted for General Counsel approval',
      },
    ];

    const notifications: NotificationItem[] = [
      {
        id: 'notif-01',
        organizationId: orgId,
        title: 'Pending General Counsel Approval',
        message: 'September 2026 Legal Department performance measurement submitted by Legal Manager is awaiting your review.',
        type: 'APPROVAL',
        timestamp: '2026-09-19 14:15:00',
        read: false,
        linkTab: 'approvals',
      },
      {
        id: 'notif-02',
        organizationId: orgId,
        title: 'High Court Hearing Reminder',
        message: 'Writ Petition 8942/2025 hearing scheduled before Bombay High Court on 08 October 2026.',
        type: 'DEADLINE',
        timestamp: '2026-09-20 10:00:00',
        read: false,
        linkTab: 'litigation',
      },
      {
        id: 'notif-03',
        organizationId: orgId,
        title: 'GST Intelligence Notice Response Due',
        message: 'Deputy Commissioner GST show cause reply deadline is 30 September 2026 (8 days remaining).',
        type: 'ALERT',
        timestamp: '2026-09-20 11:30:00',
        read: false,
        linkTab: 'notices',
      },
      {
        id: 'notif-04',
        organizationId: orgId,
        title: 'RERA Q2 Compliance Window Open',
        message: 'Quarterly filing for SkyLine Heights and Grand Bay Greens due by 15 October 2026.',
        type: 'INFO',
        timestamp: '2026-09-18 09:00:00',
        read: true,
        linkTab: 'compliance',
      },
    ];

    const reviews: PerformanceReview[] = [
      {
        id: 'rev-01',
        organizationId: orgId,
        periodId: 'period-2026-08',
        reviewerId: 'usr-madhav',
        reviewerName: 'Madhav Oak',
        overallScore: 91.8,
        performanceSummary:
          'Solid performance across Title Due Diligence, RERA quarterly disclosures and EPC contract execution. The department maintained a strong title clearance pace enabling timely acquisition of Hinjawadi Phase 3.',
        majorAchievements:
          '1. Completed 30-year search and title certification for 12.5-acre parcel with zero post-closing defects.\n2. Executed ₹85 Cr L&T EPC agreement within 48 hours SLA.\n3. Successfully defended SkyLine Tower B interim injunction application in City Civil Court.',
        identifiedProblems:
          'Minor delay in responding to municipal tree authority show cause notice due to external arborist delay. External counsel billing for NCLT matter exceeded initial estimate.',
        reasonsForUnderperformance:
          'Government holidays and municipal office reorganization slowed down tree authority hearing dates.',
        correctiveActions:
          '1. Implement automated calendar alert 7 days prior to notice expiry.\n2. Establish capped fee schedules with Tier-1 dispute resolution firms.',
        managementComments: 'Reviewed and commended by CEO Sunil Mehta on 05 Sep 2026.',
        createdDate: '2026-09-04',
        status: 'PUBLISHED',
      },
    ];

    const scoringSettings: Record<string, ScoringSettings> = {
      [orgId]: { ...DEFAULT_SCORING_SETTINGS },
    };

    // Seeded Submissions connecting Lower Employees -> Upper Managers -> GM
    const submissions: KPISubmission[] = [
      {
        id: 'sub-01',
        organizationId: orgId,
        periodId: 'period-2026-09',
        kpiId: 'kpi-01-01',
        kpiCode: 'K1-KPI-01',
        kpiName: 'Title Due Diligence Reports Cleared within SLA %',
        kraId: 'kra-01',
        kraName: 'Land Title & Property Due Diligence Compliance',
        employeeId: 'usr-parul',
        employeeName: 'Parul Tiwari',
        employeeDesignation: '2nd Level',
        employeeLevel: 2,
        department: 'Legal Compliance',
        wing: 'Legal',
        managerId: 'usr-madhav',
        managerName: 'Madhav Oak',
        achievedValue: 96,
        targetValue: 95,
        unit: '%',
        notes: 'Completed comprehensive title search across all revenue registries. Full 30-year non-encumbrance verified.',
        submittedDate: '2026-09-18',
        document: {
          fileName: 'Land_Title_Search_Certification_Report.pdf',
          fileType: 'PDF',
          fileSize: '3.4 MB',
          fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA2Nz4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzEyIFRECihtdW5pY2lwYWwgQXJjaGl0ZWN0dXJhbCBTYW5jdGlvbiBEcmF3aW5ncyAtIFNreUxpbmUgVG93ZXIgQSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA2NyAwMDAwMCBuIAowMDAwMDAwMTIyIDAwMDAwIGbiAKMDAwMDAwMDIxNCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjMzMQolJUVPRg==',
          description: 'Verified land title search report and non-encumbrance certificate',
        },
        status: 'APPROVED',
        pointsAwarded: 100,
        maxPoints: 100,
        approvalRemarks: 'Excellent diligence. Meets statutory board requirements.',
        approvedBy: 'Madhav Oak',
        approvedDate: '2026-09-19',
      },
      {
        id: 'sub-02',
        organizationId: orgId,
        periodId: 'period-2026-09',
        kpiId: 'kpi-01-02',
        kpiCode: 'K1-KPI-02',
        kpiName: 'Title Defect & Encumbrance Resolution TAT',
        kraId: 'kra-01',
        kraName: 'Land Title & Property Due Diligence Compliance',
        employeeId: 'usr-parul',
        employeeName: 'Parul Tiwari',
        employeeDesignation: '2nd Level',
        employeeLevel: 2,
        department: 'Legal Compliance',
        wing: 'Legal',
        managerId: 'usr-madhav',
        managerName: 'Madhav Oak',
        achievedValue: 2,
        targetValue: 3,
        unit: 'days',
        notes: 'Expedited resolution of pending revenue mutation requisitions within 2 days (target was 3 days). Attached authority endorsement slip.',
        submittedDate: '2026-09-21',
        document: {
          fileName: 'Revenue_Encumbrance_Resolution_Dossier.pdf',
          fileType: 'PDF',
          fileSize: '2.8 MB',
          fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA2Nz4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzEyIFRECihtdW5pY2lwYWwgQXJjaGl0ZWN0dXJhbCBTYW5jdGlvbiBEcmF3aW5ncyAtIFNreUxpbmUgVG93ZXIgQSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA2NyAwMDAwMCBuIAowMDAwMDAwMTIyIDAwMDAwIGbiAKMDAwMDAwMDIxNCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjMzMQolJUVPRg==',
          description: 'Authority certified encumbrance resolution clearance',
        },
        status: 'PENDING_APPROVAL',
        pointsAwarded: 0,
        maxPoints: 100,
      },
    ];

    return {
      organizations,
      companies,
      projects,
      users,
      financialYears,
      periods,
      kras,
      kpis,
      targets,
      measurements,
      evidence,
      submissions,
      contracts,
      compliances,
      litigations,
      notices,
      risks,
      dueDiligences,
      approvals,
      transactions,
      tasks,
      auditLogs,
      notifications,
      reviews,
      scoringSettings,
    };
  }

  // Helper methods for multi-tenant isolation and data access
  public getKRAs(orgId: string): KRA[] {
    return this.state.kras.filter((k) => k.organizationId === orgId);
  }

  public getKPIs(orgId: string): KPI[] {
    return this.state.kpis.filter((k) => k.organizationId === orgId);
  }

  public getMeasurements(orgId: string, periodId?: string): KPIMeasurement[] {
    return this.state.measurements.filter(
      (m) => m.organizationId === orgId && (!periodId || m.periodId === periodId)
    );
  }

  public getSubmissions(
    orgId: string,
    filter?: { employeeId?: string; managerId?: string; periodId?: string; currentUserId?: string }
  ): KPISubmission[] {
    const user = filter?.currentUserId ? this.state.users.find((u) => u.id === filter.currentUserId) : null;

    return this.state.submissions.filter((s) => {
      if (s.organizationId !== orgId) return false;
      if (filter?.periodId && s.periodId !== filter.periodId) return false;

      // Strict Document & Submission Privacy per Org Chart:
      // "the lower emp submit document only to their manager only that was in the org chart . other should not see document"
      if (user) {
        if (user.level === 3) {
          // Technical Staff / Lower Employee can strictly ONLY see their own submissions
          if (s.employeeId !== user.id) return false;
        } else if (user.level === 2) {
          // Wing Manager can strictly ONLY see:
          // 1. Deliverables where they are the designated direct manager in the org chart
          // 2. Deliverables they submitted themselves
          const isDirectSubordinate = s.managerId === user.id || (user.subordinateIds && user.subordinateIds.includes(s.employeeId));
          const isSelf = s.employeeId === user.id;
          if (!isDirectSubordinate && !isSelf) return false;
        }
        // Level 1: GM / Head of Department oversees cross-wing department governance
      }

      if (filter?.employeeId && s.employeeId !== filter.employeeId) return false;
      if (filter?.managerId && s.managerId !== filter.managerId) return false;
      return true;
    });
  }

  public addSubmission(submission: KPISubmission): KPISubmission {
    // STRICT ORG CHART ROUTING:
    // Lower employee submits document ONLY to their assigned manager in the org chart
    const employee = this.state.users.find((u) => u.id === submission.employeeId);
    if (employee && employee.managerId) {
      const orgChartManager = this.state.users.find((u) => u.id === employee.managerId);
      if (orgChartManager) {
        submission.managerId = orgChartManager.id;
        submission.managerName = orgChartManager.name;
      }
      submission.department = employee.department || submission.department;
      submission.wing = employee.wing || submission.wing;
    }

    this.state.submissions.unshift(submission);

    // Also register as KPI Evidence for traceability
    if (submission.document) {
      this.state.evidence.push({
        id: `ev-${submission.id}`,
        organizationId: submission.organizationId,
        measurementId: `msr-${submission.kpiId}-${submission.periodId}`,
        kpiId: submission.kpiId,
        periodId: submission.periodId,
        fileName: submission.document.fileName,
        fileType: (submission.document.fileType?.toUpperCase() as any) || 'DOCUMENT',
        fileSize: submission.document.fileSize || '2.0 MB',
        uploadedBy: submission.employeeName,
        uploadedDate: submission.submittedDate,
        description: submission.notes || submission.document.description || '',
        documentUrl: submission.document.fileData,
      });
    }

    // Add Audit Log
    this.addAuditLog({
      organizationId: submission.organizationId,
      userId: submission.employeeId,
      userName: submission.employeeName,
      userRole: employee?.role || 'LEGAL_EXECUTIVE',
      action: 'SUBMIT_KRA_WORK',
      entity: 'KPI_SUBMISSION',
      entityId: submission.id,
      newValue: `${submission.employeeName} submitted deliverable for ${submission.kpiName} with confidential document: ${submission.document.fileName}. Routed strictly to Org-Chart Manager ${submission.managerName}.`,
    });

    return submission;
  }

  public approveSubmission(
    submissionId: string,
    approver: { id: string; name: string; role: User['role'] },
    approverName: string,
    remarks?: string
  ): { submission: KPISubmission; rolledUpKras: any[] } {
    const sub = this.state.submissions.find((s) => s.id === submissionId);
    if (!sub) {
      throw new Error(`Submission ${submissionId} not found`);
    }
    if (sub.status !== 'PENDING_APPROVAL') {
      throw new Error(`Submission is already ${sub.status.replace('_', ' ').toLowerCase()} and cannot be approved again.`);
    }

    const period = this.state.periods.find((p) => p.id === sub.periodId && p.organizationId === sub.organizationId);
    const kpi = this.state.kpis.find((k) => k.id === sub.kpiId);
    const updatesMeasurement = !sub.isManagerRollup && Boolean(kpi);
    if (updatesMeasurement && period?.status === 'LOCKED') {
      throw new Error(`${period.name} is LOCKED. Reopen the period before approving deliverables that change its KPI actuals.`);
    }

    sub.status = 'APPROVED';
    sub.pointsAwarded = sub.maxPoints || 100;
    sub.approvalRemarks = remarks || 'Approved. Deliverable meets all compliance criteria. Points awarded.';
    sub.approvedBy = approverName;
    sub.approvedDate = new Date().toISOString().slice(0, 10);

    // Record the approved achieved value as the KPI actual for the period. Manager roll-up packages
    // count staff deliverables rather than KPI units, so they never overwrite a KPI measurement.
    if (updatesMeasurement && kpi) {
      const calc = calculateKPIAchievement(kpi, sub.achievedValue, kpi.targetValue, this.getScoringSettings(sub.organizationId));
      let measurement = this.state.measurements.find(
        (m) => m.kpiId === sub.kpiId && m.periodId === sub.periodId && m.organizationId === sub.organizationId
      );

      if (measurement) {
        measurement.actual = sub.achievedValue;
        measurement.achievement = calc.achievement;
        measurement.weightedScore = calc.weightedScore;
        measurement.status = calc.status;
        measurement.calculatedAutomatically = false;
        measurement.approvalStatus = 'APPROVED';
        measurement.approvedBy = approverName;
        measurement.approvedDate = sub.approvedDate;
      } else {
        measurement = {
          id: `msr-${sub.kpiId}-${sub.periodId}`,
          organizationId: sub.organizationId,
          kpiId: sub.kpiId,
          periodId: sub.periodId,
          target: kpi.targetValue,
          actual: sub.achievedValue,
          achievement: calc.achievement,
          weightedScore: calc.weightedScore,
          status: calc.status,
          approvalStatus: 'APPROVED',
          calculatedAutomatically: false,
          isManuallyOverridden: false,
          submittedBy: sub.employeeId,
          submittedDate: sub.submittedDate,
          approvedBy: approverName,
          approvedDate: sub.approvedDate,
        };
        this.state.measurements.push(measurement);
      }
    }

    // Trigger Hierarchical Rollup:
    // Manager's KRA completion is calculated from all direct subordinates' approved submissions!
    const manager = this.state.users.find((u) => u.id === sub.managerId);
    const rolledUpKras: any[] = [];

    if (manager) {
      const directSubs = this.state.users.filter((u) => u.managerId === manager.id);
      const subIds = directSubs.map((s) => s.id);
      
      // All submissions for this manager's subordinates in this period
      const teamSubs = this.state.submissions.filter(
        (s) => s.periodId === sub.periodId && subIds.includes(s.employeeId)
      );
      
      const totalTeamCount = directSubs.length;
      // Number of direct reports with at least one approved deliverable this period
      const approvedCount = new Set(teamSubs.filter((s) => s.status === 'APPROVED').map((s) => s.employeeId)).size;
      const rollupPercent = totalTeamCount > 0 ? Math.min(100, Math.round((approvedCount / totalTeamCount) * 100)) : 100;

      rolledUpKras.push({
        managerId: manager.id,
        managerName: manager.name,
        level: manager.level,
        wing: manager.wing,
        rollupPercent,
        approvedSubordinates: approvedCount,
        totalSubordinates: totalTeamCount,
      });

      // MULTI-LEVEL APPROVAL CHAIN (Staff -> Manager -> HOD):
      // When a Level 2 manager approves a Level 3 submission, the manager's own aggregated
      // KRA/KPI achievement for the period automatically becomes a submission routed up
      // to Level 1 (HOD Madhav Oak), with its own evidence requirement, visible
      // in Madhav Oak's "Pending for GM Review" queue!
      if (manager.level === 2) {
        const gm = this.state.users.find((u) => u.level === 1 && u.role === 'LEGAL_HEAD') || { id: 'usr-madhav', name: 'Madhav Oak' };
        const managerKraId = manager.assignedKras?.[0] || 'kra-02';
        const managerKra = this.state.kras.find((k) => k.id === managerKraId);
        const managerKpi = this.state.kpis.find((k) => k.kraId === managerKraId) || this.state.kpis[0];

        let mgrRollupSub = this.state.submissions.find(
          (s) => s.employeeId === manager.id && s.periodId === sub.periodId && s.isManagerRollup
        );

        if (mgrRollupSub) {
          mgrRollupSub.achievedValue = approvedCount;
          mgrRollupSub.targetValue = totalTeamCount;
          mgrRollupSub.status = 'PENDING_APPROVAL';
          mgrRollupSub.notes = `Consolidated Wing Dossier: ${approvedCount} of ${totalTeamCount} staff deliverables verified and approved by ${manager.name}. Submitted upward to ${gm.name} for executive authorization.`;
        } else {
          mgrRollupSub = {
            id: `sub-mgr-rollup-${manager.id}-${sub.periodId}`,
            organizationId: sub.organizationId,
            periodId: sub.periodId,
            kpiId: managerKpi?.id || 'kpi-02-01',
            kpiCode: `${manager.wing || 'MGR'}-CONSOL`,
            kpiName: `${manager.wing || 'Wing'} Aggregated Deliverables & Technical Compliance`,
            kraId: managerKraId,
            kraName: managerKra?.name || 'Department Compliance Governance',
            employeeId: manager.id,
            employeeName: manager.name,
            employeeDesignation: manager.designation,
            employeeLevel: 2,
            department: manager.department,
            wing: manager.wing,
            managerId: gm.id,
            managerName: gm.name,
            achievedValue: approvedCount,
            targetValue: totalTeamCount,
            unit: 'staff deliverables',
            notes: `Consolidated Wing Dossier: ${approvedCount} of ${totalTeamCount} staff deliverables verified and approved by ${manager.name}. Submitted upward to ${gm.name} for executive authorization.`,
            submittedDate: new Date().toISOString().slice(0, 10),
            document: {
              fileName: `${manager.wing || 'Wing'}_Consolidated_KRA_Audit_Report.pdf`,
              fileType: 'PDF',
              fileSize: '3.4 MB',
              fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA2Nz4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzEyIFRECihtdW5pY2lwYWwgQXJjaGl0ZWN0dXJhbCBTYW5jdGlvbiBEcmF3aW5ncyAtIFNreUxpbmUgVG93ZXIgQSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA2NyAwMDAwMCBuIAowMDAwMDAwMTIyIDAwMDAwIGbiAKMDAwMDAwMDIxNCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjMzMQolJUVPRg==',
              description: `Consolidated wing technical compliance dossier verified by ${manager.name}`,
            },
            status: 'PENDING_APPROVAL',
            pointsAwarded: 0,
            maxPoints: 100,
            isManagerRollup: true,
          };
          this.state.submissions.unshift(mgrRollupSub);
        }
      }

      // Now roll up to the Head of Department (Level 1)
      const gm = this.state.users.find((u) => u.level === 1 && u.role === 'LEGAL_HEAD');
      if (gm) {
        const gmDepartmentRollup = this.getHierarchyRollup(sub.organizationId, sub.periodId).head.departmentRollupScore;

        rolledUpKras.push({
          managerId: gm.id,
          managerName: gm.name,
          level: 1,
          wing: 'Department Leadership',
          rollupPercent: gmDepartmentRollup,
        });
      }
    }

    // Add Audit Log
    this.addAuditLog({
      organizationId: sub.organizationId,
      userId: approver.id,
      userName: approverName,
      userRole: approver.role,
      action: 'APPROVE_KRA_WORK',
      entity: 'KPI_SUBMISSION',
      entityId: sub.id,
      newValue: `${approverName} approved deliverable from ${sub.employeeName}. Awarded ${sub.pointsAwarded} points. Hierarchical roll-up updated to Upper Manager KRA.`,
    });

    return { submission: sub, rolledUpKras };
  }

  public getReportingChain(userId: string, periodId: string): any[] {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return [];

    const chain: any[] = [];
    let currentManagerId = user.managerId;
    let depth = 1;

    while (currentManagerId && depth <= 3) {
      const mgr = this.state.users.find((u) => u.id === currentManagerId);
      if (!mgr) break;

      const isDirect = depth === 1;
      const isHOD = mgr.level === 1 || !mgr.managerId;

      // Find manager's assigned KRAs and KPIs
      const mgrKraIds = mgr.assignedKras || [];
      const assignedKras = this.state.kras
        .filter((k) => mgrKraIds.includes(k.id) || (mgr.level === 1 && k.organizationId === mgr.organizationId))
        .map((kra) => {
          const kpis = this.state.kpis
            .filter((kpi) => kpi.kraId === kra.id)
            .map((kpi) => {
              const msr = this.state.measurements.find(
                (m) => m.kpiId === kpi.id && m.periodId === periodId
              );
              const sub = this.state.submissions.find(
                (s) => s.kpiId === kpi.id && s.periodId === periodId && s.employeeId === mgr.id
              );

              return {
                id: kpi.id,
                kpiCode: kpi.kpiCode,
                name: kpi.name,
                targetValue: kpi.targetValue,
                unit: kpi.unit,
                weight: kpi.weight,
                actual: msr?.actual,
                status: msr?.status || 'PENDING',
                submissionStatus: sub?.status || (msr?.approvalStatus === 'APPROVED' ? 'APPROVED' : 'NOT_SUBMITTED'),
                submittedDate: sub?.submittedDate,
                approvedDate: sub?.approvedDate,
                documentFileName: sub?.document?.fileName || (msr ? `${kpi.kpiCode}_Compliance_Report.pdf` : undefined),
                hasDocument: Boolean(sub?.document?.fileName || msr),
              };
            });

          return {
            id: kra.id,
            name: kra.name,
            weight: kra.weight,
            kpis,
          };
        });

      chain.push({
        user: {
          id: mgr.id,
          name: mgr.name,
          designation: mgr.designation,
          department: mgr.department,
          wing: mgr.wing,
          level: mgr.level,
          role: mgr.role,
        },
        relationship: isDirect ? 'DIRECT_MANAGER' : isHOD ? 'HOD' : 'EXECUTIVE',
        assignedKras,
      });

      currentManagerId = mgr.managerId;
      depth++;
    }

    return chain;
  }

  public rejectSubmission(
    submissionId: string,
    rejector: { id: string; name: string; role: User['role'] },
    rejectorName: string,
    remarks: string
  ): KPISubmission {
    const sub = this.state.submissions.find((s) => s.id === submissionId);
    if (!sub) {
      throw new Error(`Submission ${submissionId} not found`);
    }
    if (sub.status !== 'PENDING_APPROVAL') {
      throw new Error(`Submission is already ${sub.status.replace('_', ' ').toLowerCase()}; only pending submissions can be sent back for revision.`);
    }

    sub.status = 'REJECTED';
    sub.pointsAwarded = 0;
    sub.approvalRemarks = remarks;
    sub.approvedBy = rejectorName;
    sub.approvedDate = new Date().toISOString().slice(0, 10);

    // Add Audit Log
    this.addAuditLog({
      organizationId: sub.organizationId,
      userId: rejector.id,
      userName: rejectorName,
      userRole: rejector.role,
      action: 'REJECT_KRA_WORK',
      entity: 'KPI_SUBMISSION',
      entityId: sub.id,
      newValue: `${rejectorName} requested revision for ${sub.employeeName}: ${remarks}`,
    });

    return sub;
  }

  public getHierarchyRollup(orgId: string, periodId: string) {
    const orgUsers = this.state.users.filter((u) => u.organizationId === orgId);
    const gm = orgUsers.find((u) => u.level === 1 && u.role === 'LEGAL_HEAD') || orgUsers[0];
    const managers = orgUsers.filter((u) => u.level === 2);
    const subordinates = orgUsers.filter((u) => u.level === 3);

    // Staff completion = share of their deliverables this period that were approved (0% if nothing submitted)
    const buildStaffNode = (staff: User) => {
      const staffSubmissions = this.state.submissions.filter(
        (s) => s.organizationId === orgId && s.periodId === periodId && s.employeeId === staff.id
      );
      const approvedCount = staffSubmissions.filter((s) => s.status === 'APPROVED').length;
      const completionRate = staffSubmissions.length > 0 ? Math.round((approvedCount / staffSubmissions.length) * 100) : 0;
      const points = staffSubmissions.reduce((acc, s) => acc + s.pointsAwarded, 0);

      return {
        id: staff.id,
        name: staff.name,
        designation: staff.designation,
        level: 3,
        wing: staff.wing,
        completionRate,
        points,
        submissions: staffSubmissions,
        isCompleted: approvedCount > 0,
      };
    };

    const managerNodes = managers.map((mgr) => {
      const subNodes = subordinates.filter((s) => s.managerId === mgr.id).map(buildStaffNode);

      const totalSubs = subNodes.length;
      const completedSubs = subNodes.filter((s) => s.completionRate >= 100).length;
      const managerRollup = totalSubs > 0 ? Math.round(subNodes.reduce((acc, s) => acc + s.completionRate, 0) / totalSubs) : 100;

      return {
        id: mgr.id,
        name: mgr.name,
        designation: mgr.designation,
        level: 2,
        wing: mgr.wing,
        rollupScore: managerRollup,
        isCompleted: managerRollup >= 100,
        directSubordinatesCount: totalSubs,
        completedSubordinatesCount: completedSubs,
        subordinates: subNodes,
      };
    });

    // Staff reporting directly to the HOD (no wing manager in between)
    const directStaffNodes = subordinates.filter((s) => s.managerId === gm?.id).map(buildStaffNode);

    const headInputs = [
      ...managerNodes.map((m) => m.rollupScore),
      ...directStaffNodes.map((s) => s.completionRate),
    ];
    const gmRollupScore = headInputs.length > 0 ? Math.round(headInputs.reduce((a, b) => a + b, 0) / headInputs.length) : 0;

    return {
      periodId,
      head: {
        id: gm.id,
        name: gm.name,
        designation: gm.designation,
        level: 1,
        department: gm.department,
        departmentRollupScore: gmRollupScore,
        isCompleted: gmRollupScore >= 100,
      },
      managers: managerNodes,
      directStaff: directStaffNodes,
    };
  }

  public getScoringSettings(orgId: string): ScoringSettings {
    return this.state.scoringSettings[orgId] || DEFAULT_SCORING_SETTINGS;
  }

  public updateScoringSettings(orgId: string, settings: Partial<ScoringSettings>): ScoringSettings {
    const current = this.getScoringSettings(orgId);
    this.state.scoringSettings[orgId] = { ...current, ...settings };
    return this.state.scoringSettings[orgId];
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.state.auditLogs.unshift(newEntry);
    return newEntry;
  }
}

// Cached on globalThis so Next.js dev hot reloads (which re-evaluate this module) do not re-seed the database
const globalForDb = globalThis as unknown as { __db?: MemoryDatabase };
export const db = (globalForDb.__db ??= new MemoryDatabase());
