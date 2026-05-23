package com.library.service.impl;

import com.library.service.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * SMS service stub implementation
 * TODO: Integrate with actual SMS provider (e.g., Aliyun SMS, Tencent SMS)
 */
@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Override
    public void sendOverdueReminder(String phone, String bookName, String dueDate) {
        log.info("[SMS STUB] Overdue reminder to {}: Book '{}' was due on {}", phone, bookName, dueDate);
    }

    @Override
    public void sendBorrowConfirmation(String phone, String bookName, String dueDate) {
        log.info("[SMS STUB] Borrow confirmation to {}: Book '{}' due on {}", phone, bookName, dueDate);
    }

    @Override
    public void sendRenewalConfirmation(String phone, String bookName, String newDueDate) {
        log.info("[SMS STUB] Renewal confirmation to {}: Book '{}' new due date {}", phone, bookName, newDueDate);
    }
}
