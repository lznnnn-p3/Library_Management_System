package com.library.service;

/**
 * SMS notification service interface
 * Implement this interface to send SMS reminders for overdue books
 */
public interface SmsService {

    /**
     * Send overdue reminder SMS
     * @param phone phone number
     * @param bookName book name
     * @param dueDate due date string
     */
    void sendOverdueReminder(String phone, String bookName, String dueDate);

    /**
     * Send borrow confirmation SMS
     * @param phone phone number
     * @param bookName book name
     * @param dueDate due date string
     */
    void sendBorrowConfirmation(String phone, String bookName, String dueDate);

    /**
     * Send renewal confirmation SMS
     * @param phone phone number
     * @param bookName book name
     * @param newDueDate new due date string
     */
    void sendRenewalConfirmation(String phone, String bookName, String newDueDate);
}
