package com.library.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.dto.BookDTO;
import com.library.dto.Result;
import com.library.entity.BookInfo;
import com.library.service.BookInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/book")
public class BookInfoController {

    @Autowired
    private BookInfoService bookService;

    @GetMapping("/list")
    public Result<Page<BookInfo>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String bookName,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String publisher,
            @RequestParam(required = false) String category) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) auth.getDetails();
        return Result.success(bookService.pageList(pageNum, pageSize, bookName, author, isbn, publisher, category, userId));
    }

    @GetMapping("/{id}")
    public Result<BookInfo> getById(@PathVariable Long id) {
        return Result.success(bookService.getById(id));
    }

    @PostMapping
    public Result<Void> add(@Valid @RequestBody BookDTO dto) {
        bookService.addBook(dto);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> update(@Valid @RequestBody BookDTO dto) {
        bookService.updateBook(dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        bookService.deleteBook(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/stats/categories")
    public Result<List<Map<String, Object>>> categoryStats() {
        return Result.success(bookService.getCategoryStats());
    }

    @PostMapping("/import")
    public Result<Map<String, Object>> importBooks(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择文件");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".xlsx")) {
            return Result.error("仅支持 .xlsx 格式的 Excel 文件");
        }
        return Result.success("导入完成", bookService.batchImport(file));
    }
}
