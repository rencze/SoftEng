BOOKING CONSULTATION 
→ PENDING 
→ BOOKING TIME 
→ PREVIEW QUOTATION (face-to-face direct approval)
→ QUOTATION 
→ SERVICE JOB 
→ SERVICE JOB WORKFLOW 
→ COMPLETE 
→ PAYMENT

SERVICE REQUEST BOOKING 
→ PENDING 
→ ACCEPT SERVICE 
→ REVIEW SERVICE (MODIFY) 
→ GENERATE INTO QUOTATION 
→ SERVICE JOB 
→ SERVICE JOB WORKFLOW 
→ COMPLETE 
→ PAYMENT



CREATE TABLE serviceRequestBooking (
  serviceRequestId INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  technicianId INT DEFAULT NULL,
  serviceId INT DEFAULT NULL,
  servicePackageId INT DEFAULT NULL,
  status ENUM('Pending','Accepted','Reviewed','Converted','Cancelled','Rescheduled') DEFAULT 'Pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (customerId) REFERENCES customers(customerId) ON DELETE CASCADE,
  FOREIGN KEY (technicianId) REFERENCES technicians(technicianId) ON DELETE SET NULL,
  FOREIGN KEY (serviceId) REFERENCES services(serviceId) ON DELETE SET NULL,
  FOREIGN KEY (servicePackageId) REFERENCES service_package(servicePackageId) ON DELETE SET NULL,

  INDEX idx_customer (customerId),
  INDEX idx_technician (technicianId),
  INDEX idx_service (serviceId),
  INDEX idx_package (servicePackageId)
);

CREATE TABLE serviceRequestBookingHistory (
  historyId INT AUTO_INCREMENT PRIMARY KEY,
  serviceRequestId INT NOT NULL,
  status ENUM('Pending','Accepted','Reviewed','Converted','Cancelled','Rescheduled') DEFAULT 'Pending',
  changedBy INT,
  remarks TEXT,
  changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (serviceRequestId) REFERENCES serviceRequestBooking(serviceRequestId) ON DELETE CASCADE,
  FOREIGN KEY (changedBy) REFERENCES users(userId) ON DELETE SET NULL,

  INDEX idx_service_request (serviceRequestId),
  INDEX idx_changed_by (changedBy)
);


CREATE TABLE quotation (
  quotationId INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,                     -- from booking table
  technicianId INT NOT NULL,                  -- technician who created the quote
  customerId INT NOT NULL,                    -- customer receiving it
  serviceId INT DEFAULT NULL,                 -- optional single service
  servicePackageId INT DEFAULT NULL,          -- optional service package
  laborCost DOUBLE DEFAULT 0,
  partsCost DOUBLE DEFAULT 0,
  discount DOUBLE DEFAULT 0,
  totalCost DOUBLE GENERATED ALWAYS AS (laborCost + partsCost - discount) STORED,
  workTimeEstimation INT,                     -- estimated hours or minutes
  quote TEXT,                                 -- detailed description or notes
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  approvedAt DATETIME NULL,

  -- Foreign Keys
  FOREIGN KEY (bookingId) REFERENCES booking(bookingId) ON DELETE CASCADE,
  FOREIGN KEY (technicianId) REFERENCES technicians(technicianId) ON DELETE SET NULL,
  FOREIGN KEY (customerId) REFERENCES customers(customerId) ON DELETE CASCADE,
  FOREIGN KEY (serviceId) REFERENCES services(serviceId) ON DELETE SET NULL,
  FOREIGN KEY (servicePackageId) REFERENCES service_package(servicePackageId) ON DELETE SET NULL,

  -- Indexes for performance
  INDEX idx_booking (bookingId),
  INDEX idx_technician (technicianId),
  INDEX idx_customer (customerId),
  INDEX idx_service (serviceId),
  INDEX idx_service_package (servicePackageId)
);
