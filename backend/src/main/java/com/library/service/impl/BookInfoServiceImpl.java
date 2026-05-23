package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.dto.BookDTO;
import com.library.entity.BookBorrow;
import com.library.entity.BookInfo;
import com.library.mapper.BookBorrowMapper;
import com.library.mapper.BookInfoMapper;
import com.library.service.BookInfoService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookInfoServiceImpl extends ServiceImpl<BookInfoMapper, BookInfo> implements BookInfoService {

    @Autowired
    private BookBorrowMapper borrowMapper;

    @Override
    public Page<BookInfo> pageList(int pageNum, int pageSize, String bookName, String author, String isbn, String publisher, String category, Long userId) {
        LambdaQueryWrapper<BookInfo> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(bookName)) {
            wrapper.like(BookInfo::getBookName, bookName);
        }
        if (StringUtils.hasText(author)) {
            wrapper.like(BookInfo::getAuthor, author);
        }
        if (StringUtils.hasText(isbn)) {
            wrapper.like(BookInfo::getIsbn, isbn);
        }
        if (StringUtils.hasText(publisher)) {
            wrapper.like(BookInfo::getPublisher, publisher);
        }
        if (StringUtils.hasText(category)) {
            wrapper.eq(BookInfo::getCategory, category);
        }
        wrapper.orderByDesc(BookInfo::getCreateTime);
        Page<BookInfo> page = page(new Page<>(pageNum, pageSize), wrapper);

        // Set borrowed flag for current user
        if (userId != null) {
            LambdaQueryWrapper<BookBorrow> borrowWrapper = new LambdaQueryWrapper<>();
            borrowWrapper.eq(BookBorrow::getUserId, userId)
                    .eq(BookBorrow::getStatus, 1);
            List<BookBorrow> borrows = borrowMapper.selectList(borrowWrapper);
            Set<Long> borrowedBookIds = borrows.stream()
                    .map(BookBorrow::getBookId)
                    .collect(Collectors.toSet());
            page.getRecords().forEach(book -> {
                book.setBorrowed(borrowedBookIds.contains(book.getId()));
            });
        }
        return page;
    }

    @Override
    public boolean addBook(BookDTO dto) {
        BookInfo book = new BookInfo();
        book.setBookName(dto.getBookName());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setPublisher(dto.getPublisher());
        book.setPublishDate(dto.getPublishDate());
        book.setCategory(dto.getCategory());
        book.setPrice(dto.getPrice());
        book.setStock(dto.getStock());
        book.setDescription(dto.getDescription());
        book.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        return save(book);
    }

    @Override
    public boolean updateBook(BookDTO dto) {
        BookInfo book = getById(dto.getId());
        if (book == null) throw new RuntimeException("图书不存在");
        book.setBookName(dto.getBookName());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setPublisher(dto.getPublisher());
        book.setPublishDate(dto.getPublishDate());
        book.setCategory(dto.getCategory());
        book.setPrice(dto.getPrice());
        book.setStock(dto.getStock());
        book.setDescription(dto.getDescription());
        if (dto.getStatus() != null) book.setStatus(dto.getStatus());
        return updateById(book);
    }

    @Override
    public boolean deleteBook(Long id) {
        return removeById(id);
    }

    @Override
    public List<Map<String, Object>> getCategoryStats() {
        List<BookInfo> books = list();
        Map<String, Long> stats = books.stream()
                .filter(b -> b.getCategory() != null)
                .collect(Collectors.groupingBy(BookInfo::getCategory, Collectors.counting()));
        List<Map<String, Object>> result = new ArrayList<>();
        stats.forEach((category, count) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("category", category);
            item.put("count", count);
            result.add(item);
        });
        return result;
    }

    @Override
    public Map<String, Object> batchImport(MultipartFile file) {
        int success = 0;
        int fail = 0;
        List<String> errors = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();

            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    BookInfo book = new BookInfo();
                    book.setBookName(getCellValue(row.getCell(0)));
                    book.setAuthor(getCellValue(row.getCell(1)));
                    book.setIsbn(getCellValue(row.getCell(2)));
                    book.setPublisher(getCellValue(row.getCell(3)));
                    book.setCategory(getCellValue(row.getCell(4)));

                    String priceStr = getCellValue(row.getCell(5));
                    if (StringUtils.hasText(priceStr)) {
                        book.setPrice(new BigDecimal(priceStr));
                    }

                    String stockStr = getCellValue(row.getCell(6));
                    book.setStock(StringUtils.hasText(stockStr) ? Integer.parseInt(stockStr) : 0);

                    book.setDescription(getCellValue(row.getCell(7)));
                    book.setStatus(1);
                    book.setCreateTime(LocalDateTime.now());

                    if (!StringUtils.hasText(book.getBookName())) {
                        errors.add("第" + (i + 1) + "行: 书名不能为空");
                        fail++;
                        continue;
                    }

                    save(book);
                    success++;
                } catch (Exception e) {
                    errors.add("第" + (i + 1) + "行: " + e.getMessage());
                    fail++;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("文件读取失败: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        result.put("fail", fail);
        result.put("errors", errors);
        return result;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                double numVal = cell.getNumericCellValue();
                if (numVal == Math.floor(numVal) && !Double.isInfinite(numVal)) {
                    return String.valueOf((long) numVal);
                }
                return String.valueOf(numVal);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
}
