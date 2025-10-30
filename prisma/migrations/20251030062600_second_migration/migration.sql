-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL DEFAULT '18',
    "stateName" TEXT NOT NULL DEFAULT 'Maharashtra',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_metrics" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "finYear" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "approvedLabourBudget" DOUBLE PRECISION,
    "averageWageRatePerDay" DOUBLE PRECISION,
    "averageDaysOfEmploymentPerHousehold" DOUBLE PRECISION,
    "differentlyAbledPersonsWorked" INTEGER,
    "materialAndSkilledWages" DOUBLE PRECISION,
    "totalExpenditure" DOUBLE PRECISION,
    "wages" DOUBLE PRECISION,
    "totalAdministrativeExpenditure" DOUBLE PRECISION,
    "numberOfCompletedWorks" INTEGER,
    "numberOfOngoingWorks" INTEGER,
    "numberOfWorksTakenUp" INTEGER,
    "numberOfGPsWithNilExp" INTEGER,
    "personDaysOfCentralLiability" DOUBLE PRECISION,
    "scPersonDays" DOUBLE PRECISION,
    "stPersonDays" DOUBLE PRECISION,
    "womenPersonDays" DOUBLE PRECISION,
    "totalHouseholdsWorked" INTEGER,
    "totalIndividualsWorked" INTEGER,
    "totalNumberOfActiveJobCards" INTEGER,
    "totalNumberOfActiveWorkers" INTEGER,
    "totalNumberOfHHsCompleted100Days" INTEGER,
    "totalNumberOfJobCardsIssued" INTEGER,
    "totalNumberOfWorkers" INTEGER,
    "scWorkersAgainstActiveWorkers" DOUBLE PRECISION,
    "stWorkersAgainstActiveWorkers" DOUBLE PRECISION,
    "percentOfCategoryBWorks" DOUBLE PRECISION,
    "percentOfExpenditureOnAgricultureAllied" DOUBLE PRECISION,
    "percentOfNRMExpenditure" DOUBLE PRECISION,
    "percentagePaymentsGeneratedWithin15Days" DOUBLE PRECISION,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fetch_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "requestParams" JSONB,
    "responseTime" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fetch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "preferredLocale" TEXT NOT NULL DEFAULT 'mr',
    "preferredDistrict" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "districts_code_key" ON "districts"("code");

-- CreateIndex
CREATE INDEX "districts_stateCode_idx" ON "districts"("stateCode");

-- CreateIndex
CREATE INDEX "districts_code_idx" ON "districts"("code");

-- CreateIndex
CREATE INDEX "monthly_metrics_districtId_idx" ON "monthly_metrics"("districtId");

-- CreateIndex
CREATE INDEX "monthly_metrics_finYear_idx" ON "monthly_metrics"("finYear");

-- CreateIndex
CREATE INDEX "monthly_metrics_month_idx" ON "monthly_metrics"("month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_metrics_districtId_finYear_month_key" ON "monthly_metrics"("districtId", "finYear", "month");

-- CreateIndex
CREATE INDEX "fetch_logs_source_status_idx" ON "fetch_logs"("source", "status");

-- CreateIndex
CREATE INDEX "fetch_logs_startedAt_idx" ON "fetch_logs"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "monthly_metrics" ADD CONSTRAINT "monthly_metrics_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
