package com.library.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.library.dto.BookDTO;
import com.library.entity.BookInfo;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

public interface BookInfoService extends IService<BookInfo> {
    Page<BookInfo> pageList(int pageNum, int pageSize, String bookName, String author, String isbn, String publisher, String category, Long userId);
    boolean addBook(BookDTO dto);
    boolean updateBook(BookDTO dto);
    boolean deleteBook(Long id);
    List<Map<String, Object>> getCategoryStats();
    Map<String, Object> batchImport(MultipartFile file);
}
