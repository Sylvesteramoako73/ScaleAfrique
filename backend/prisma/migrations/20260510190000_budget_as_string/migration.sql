-- Change monthlyBudget from Float to String to store budget range values (e.g. "500-2000")
ALTER TABLE "StartupProfile" ALTER COLUMN "monthlyBudget" TYPE TEXT;
