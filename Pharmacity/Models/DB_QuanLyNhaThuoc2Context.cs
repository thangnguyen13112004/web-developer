using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Pharmacity.Models;

public partial class DB_QuanLyNhaThuoc2Context : DbContext
{
    public DB_QuanLyNhaThuoc2Context()
    {
    }

    public DB_QuanLyNhaThuoc2Context(DbContextOptions<DB_QuanLyNhaThuoc2Context> options)
        : base(options)
    {
    }

    public virtual DbSet<Baocao> Baocaos { get; set; }

    public virtual DbSet<Chitietdondathang> Chitietdondathangs { get; set; }

    public virtual DbSet<Chitietdonhang> Chitietdonhangs { get; set; }

    public virtual DbSet<Chitietdonthuoc> Chitietdonthuocs { get; set; }

    public virtual DbSet<Chitietphieunhap> Chitietphieunhaps { get; set; }

    public virtual DbSet<Dondathang> Dondathangs { get; set; }

    public virtual DbSet<Donhang> Donhangs { get; set; }

    public virtual DbSet<Donthuoc> Donthuocs { get; set; }

    public virtual DbSet<Khachhang> Khachhangs { get; set; }

    public virtual DbSet<Kho> Khos { get; set; }

    public virtual DbSet<Loaithuoc> Loaithuocs { get; set; }

    public virtual DbSet<Lothuoc> Lothuocs { get; set; }

    public virtual DbSet<Nhacungcap> Nhacungcaps { get; set; }

    public virtual DbSet<Nhanvien> Nhanviens { get; set; }

    public virtual DbSet<Phieunhaphang> Phieunhaphangs { get; set; }

    public virtual DbSet<Quyentruycap> Quyentruycaps { get; set; }

    public virtual DbSet<SoDiaChi> SoDiaChis { get; set; }

    public virtual DbSet<Thanhtoan> Thanhtoans { get; set; }

    public virtual DbSet<Thuoc> Thuocs { get; set; }

    public virtual DbSet<Tonkho> Tonkhos { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=LAPTOP-0T0KM268;Database=DB_QuanLyNhaThuoc2;User Id=sa;Password=123;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Baocao>(entity =>
        {
            entity.HasKey(e => e.Mabc).HasName("PK__baocao__7A2255F98F76008B");

            entity.ToTable("baocao");

            entity.Property(e => e.Mabc)
                .ValueGeneratedNever()
                .HasColumnName("mabc");
            entity.Property(e => e.Loaibaocao)
                .HasMaxLength(50)
                .HasColumnName("loaibaocao");
            entity.Property(e => e.Manv).HasColumnName("manv");
            entity.Property(e => e.Ngaylap)
                .HasColumnType("datetime")
                .HasColumnName("ngaylap");
            entity.Property(e => e.Noidung)
                .HasMaxLength(255)
                .HasColumnName("noidung");

            entity.HasOne(d => d.ManvNavigation).WithMany(p => p.Baocaos)
                .HasForeignKey(d => d.Manv)
                .HasConstraintName("FK__baocao__manv__10566F31");
        });

        modelBuilder.Entity<Chitietdondathang>(entity =>
        {
            entity.HasKey(e => new { e.Maddh, e.Mathuoc }).HasName("PK__chitietd__F076A7B631FC3DC5");

            entity.ToTable("chitietdondathang");

            entity.Property(e => e.Maddh).HasColumnName("maddh");
            entity.Property(e => e.Mathuoc).HasColumnName("mathuoc");
            entity.Property(e => e.Dongia).HasColumnName("dongia");
            entity.Property(e => e.Soluong).HasColumnName("soluong");
            entity.Property(e => e.Thanhtien)
                .HasComputedColumnSql("([soluong]*[dongia])", false)
                .HasColumnName("thanhtien");

            entity.HasOne(d => d.MaddhNavigation).WithMany(p => p.Chitietdondathangs)
                .HasForeignKey(d => d.Maddh)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietdo__maddh__06CD04F7");

            entity.HasOne(d => d.MathuocNavigation).WithMany(p => p.Chitietdondathangs)
                .HasForeignKey(d => d.Mathuoc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietdo__mathu__07C12930");
        });

        modelBuilder.Entity<Chitietdonhang>(entity =>
        {
            entity.HasKey(e => new { e.Madh, e.Malo }).HasName("PK__chitietd__2D83FA1591E8A746");

            entity.ToTable("chitietdonhang");

            entity.Property(e => e.Madh).HasColumnName("madh");
            entity.Property(e => e.Malo).HasColumnName("malo");
            entity.Property(e => e.Dongia).HasColumnName("dongia");
            entity.Property(e => e.Soluong).HasColumnName("soluong");
            entity.Property(e => e.Thanhtien).HasColumnName("thanhtien");

            entity.HasOne(d => d.MadhNavigation).WithMany(p => p.Chitietdonhangs)
                .HasForeignKey(d => d.Madh)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietdon__madh__656C112C");

            entity.HasOne(d => d.MaloNavigation).WithMany(p => p.Chitietdonhangs)
                .HasForeignKey(d => d.Malo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietdon__malo__66603565");
        });

        modelBuilder.Entity<Chitietdonthuoc>(entity =>
        {
            entity.HasKey(e => new { e.Madonthuoc, e.Mathuoc }).HasName("PK__chitietd__E923A1811CDE21CC");

            entity.ToTable("chitietdonthuoc");

            entity.Property(e => e.Madonthuoc).HasColumnName("madonthuoc");
            entity.Property(e => e.Mathuoc).HasColumnName("mathuoc");
            entity.Property(e => e.Dongia).HasColumnName("dongia");
            entity.Property(e => e.Lieudung)
                .HasMaxLength(255)
                .HasColumnName("lieudung");
            entity.Property(e => e.Soluong).HasColumnName("soluong");
            entity.Property(e => e.Thanhtien)
                .HasComputedColumnSql("([soluong]*[dongia])", false)
                .HasColumnName("thanhtien");

            entity.HasOne(d => d.MadonthuocNavigation).WithMany(p => p.Chitietdonthuocs)
                .HasForeignKey(d => d.Madonthuoc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietdo__madon__0C85DE4D");

            entity.HasOne(d => d.MathuocNavigation).WithMany(p => p.Chitietdonthuocs)
                .HasForeignKey(d => d.Mathuoc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietdo__mathu__0D7A0286");
        });

        modelBuilder.Entity<Chitietphieunhap>(entity =>
        {
            entity.HasKey(e => new { e.Mapn, e.Mathuoc, e.Solo }).HasName("PK__chitietp__0382C05D72B49D6E");

            entity.ToTable("chitietphieunhap");

            entity.Property(e => e.Mapn).HasColumnName("mapn");
            entity.Property(e => e.Mathuoc).HasColumnName("mathuoc");
            entity.Property(e => e.Solo)
                .HasMaxLength(50)
                .HasColumnName("solo");
            entity.Property(e => e.Dongia).HasColumnName("dongia");
            entity.Property(e => e.Hansudung)
                .HasColumnType("datetime")
                .HasColumnName("hansudung");
            entity.Property(e => e.Ngaysanxuat)
                .HasColumnType("datetime")
                .HasColumnName("ngaysanxuat");
            entity.Property(e => e.Soluong).HasColumnName("soluong");
            entity.Property(e => e.Thanhtien)
                .HasComputedColumnSql("([soluong]*[dongia])", false)
                .HasColumnName("thanhtien");

            entity.HasOne(d => d.MapnNavigation).WithMany(p => p.Chitietphieunhaps)
                .HasForeignKey(d => d.Mapn)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietphi__mapn__7C4F7684");

            entity.HasOne(d => d.MathuocNavigation).WithMany(p => p.Chitietphieunhaps)
                .HasForeignKey(d => d.Mathuoc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__chitietph__mathu__7D439ABD");
        });

        modelBuilder.Entity<Dondathang>(entity =>
        {
            entity.HasKey(e => e.Maddh).HasName("PK__dondatha__0BE6B3E5EC678281");

            entity.ToTable("dondathang");

            entity.Property(e => e.Maddh)
                .ValueGeneratedNever()
                .HasColumnName("maddh");
            entity.Property(e => e.Mancc).HasColumnName("mancc");
            entity.Property(e => e.Manv).HasColumnName("manv");
            entity.Property(e => e.Ngaydat)
                .HasColumnType("datetime")
                .HasColumnName("ngaydat");
            entity.Property(e => e.Tongtien).HasColumnName("tongtien");
            entity.Property(e => e.Trangthai)
                .HasMaxLength(50)
                .HasColumnName("trangthai");

            entity.HasOne(d => d.ManccNavigation).WithMany(p => p.Dondathangs)
                .HasForeignKey(d => d.Mancc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__dondathan__mancc__01142BA1");

            entity.HasOne(d => d.ManvNavigation).WithMany(p => p.Dondathangs)
                .HasForeignKey(d => d.Manv)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__dondathang__manv__02084FDA");
        });

        modelBuilder.Entity<Donhang>(entity =>
        {
            entity.HasKey(e => e.Madh).HasName("PK__donhang__7A21E02713AA0C4B");

            entity.ToTable("donhang");

            entity.Property(e => e.Madh)
                .ValueGeneratedNever()
                .HasColumnName("madh");
            entity.Property(e => e.Madonthuoc).HasColumnName("madonthuoc");
            entity.Property(e => e.Makh).HasColumnName("makh");
            entity.Property(e => e.Ngaydat)
                .HasColumnType("datetime")
                .HasColumnName("ngaydat");
            entity.Property(e => e.Tongtien).HasColumnName("tongtien");
            entity.Property(e => e.Trangthai)
                .HasMaxLength(50)
                .HasColumnName("trangthai");

            entity.HasOne(d => d.MadonthuocNavigation).WithMany(p => p.Donhangs)
                .HasForeignKey(d => d.Madonthuoc)
                .HasConstraintName("FK__donhang__madonth__60A75C0F");

            entity.HasOne(d => d.MakhNavigation).WithMany(p => p.Donhangs)
                .HasForeignKey(d => d.Makh)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donhang__makh__5FB337D6");
        });

        modelBuilder.Entity<Donthuoc>(entity =>
        {
            entity.HasKey(e => e.Madonthuoc).HasName("PK__donthuoc__12B3B5D20217026E");

            entity.ToTable("donthuoc");

            entity.Property(e => e.Madonthuoc)
                .ValueGeneratedNever()
                .HasColumnName("madonthuoc");
            entity.Property(e => e.Benhvien)
                .HasMaxLength(100)
                .HasColumnName("benhvien");
            entity.Property(e => e.Chuandoan)
                .HasMaxLength(255)
                .HasColumnName("chuandoan");
            entity.Property(e => e.Hinhanhdonthuoc)
                .HasMaxLength(255)
                .HasColumnName("hinhanhdonthuoc");
            entity.Property(e => e.Makh).HasColumnName("makh");
            entity.Property(e => e.Ngaykethuoc)
                .HasColumnType("datetime")
                .HasColumnName("ngaykethuoc");
            entity.Property(e => e.Tenbacsi)
                .HasMaxLength(100)
                .HasColumnName("tenbacsi");

            entity.HasOne(d => d.MakhNavigation).WithMany(p => p.Donthuocs)
                .HasForeignKey(d => d.Makh)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donthuoc__makh__5BE2A6F2");
        });

        modelBuilder.Entity<Khachhang>(entity =>
        {
            entity.HasKey(e => e.Makh).HasName("PK__khachhan__7A21BB4C868A1C52");

            entity.ToTable("khachhang");

            entity.HasIndex(e => e.Sdt, "UQ__khachhan__DDDFB483A6134F96").IsUnique();

            entity.Property(e => e.Makh)
                .ValueGeneratedNever()
                .HasColumnName("makh");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Hoten)
                .HasMaxLength(100)
                .HasColumnName("hoten");
            entity.Property(e => e.Matkhau)
                .HasMaxLength(100)
                .HasColumnName("matkhau");
            entity.Property(e => e.Ngaytao)
                .HasColumnType("datetime")
                .HasColumnName("ngaytao");
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .HasColumnName("sdt");
        });

        modelBuilder.Entity<Kho>(entity =>
        {
            entity.HasKey(e => e.Makho).HasName("PK__kho__0ABBFBAE09155A49");

            entity.ToTable("kho");

            entity.Property(e => e.Makho)
                .ValueGeneratedNever()
                .HasColumnName("makho");
            entity.Property(e => e.Diachi)
                .HasMaxLength(255)
                .HasColumnName("diachi");
            entity.Property(e => e.Tenkho)
                .HasMaxLength(100)
                .HasColumnName("tenkho");
        });

        modelBuilder.Entity<Loaithuoc>(entity =>
        {
            entity.HasKey(e => e.Maloai).HasName("PK__loaithuo__734B3AEA6F08A64F");

            entity.ToTable("loaithuoc");

            entity.Property(e => e.Maloai)
                .ValueGeneratedNever()
                .HasColumnName("maloai");
            entity.Property(e => e.Tenloai)
                .HasMaxLength(100)
                .HasColumnName("tenloai");
        });

        modelBuilder.Entity<Lothuoc>(entity =>
        {
            entity.HasKey(e => e.Malo).HasName("PK__lothuoc__7A21A3246FAC0A37");

            entity.ToTable("lothuoc");

            entity.HasIndex(e => new { e.Mathuoc, e.Solo }, "uq_lothuoc_solo").IsUnique();

            entity.Property(e => e.Malo)
                .ValueGeneratedNever()
                .HasColumnName("malo");
            entity.Property(e => e.Dongianhap).HasColumnName("dongianhap");
            entity.Property(e => e.Hansudung)
                .HasColumnType("datetime")
                .HasColumnName("hansudung");
            entity.Property(e => e.Mancc).HasColumnName("mancc");
            entity.Property(e => e.Manv).HasColumnName("manv");
            entity.Property(e => e.Mathuoc).HasColumnName("mathuoc");
            entity.Property(e => e.Ngaynhap)
                .HasColumnType("datetime")
                .HasColumnName("ngaynhap");
            entity.Property(e => e.Ngaysanxuat)
                .HasColumnType("datetime")
                .HasColumnName("ngaysanxuat");
            entity.Property(e => e.Solo)
                .HasMaxLength(50)
                .HasColumnName("solo");
            entity.Property(e => e.Soluongnhap).HasColumnName("soluongnhap");

            entity.HasOne(d => d.ManccNavigation).WithMany(p => p.Lothuocs)
                .HasForeignKey(d => d.Mancc)
                .HasConstraintName("FK__lothuoc__mancc__4F7CD00D");

            entity.HasOne(d => d.ManvNavigation).WithMany(p => p.Lothuocs)
                .HasForeignKey(d => d.Manv)
                .HasConstraintName("FK__lothuoc__manv__5070F446");

            entity.HasOne(d => d.MathuocNavigation).WithMany(p => p.Lothuocs)
                .HasForeignKey(d => d.Mathuoc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__lothuoc__mathuoc__4E88ABD4");
        });

        modelBuilder.Entity<Nhacungcap>(entity =>
        {
            entity.HasKey(e => e.Mancc).HasName("PK__nhacungc__0A7AC435A19C6C95");

            entity.ToTable("nhacungcap");

            entity.Property(e => e.Mancc)
                .ValueGeneratedNever()
                .HasColumnName("mancc");
            entity.Property(e => e.Diachi)
                .HasMaxLength(255)
                .HasColumnName("diachi");
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .HasColumnName("sdt");
            entity.Property(e => e.Tenncc)
                .HasMaxLength(100)
                .HasColumnName("tenncc");
        });

        modelBuilder.Entity<Nhanvien>(entity =>
        {
            entity.HasKey(e => e.Manv).HasName("PK__nhanvien__7A21B37DE06FE401");

            entity.ToTable("nhanvien");

            entity.HasIndex(e => e.Taikhoan, "UQ__nhanvien__FE7B87300D0F4A8D").IsUnique();

            entity.Property(e => e.Manv)
                .ValueGeneratedNever()
                .HasColumnName("manv");
            entity.Property(e => e.Chucvu)
                .HasMaxLength(50)
                .HasColumnName("chucvu");
            entity.Property(e => e.Hoten)
                .HasMaxLength(100)
                .HasColumnName("hoten");
            entity.Property(e => e.Matkhau)
                .HasMaxLength(100)
                .HasColumnName("matkhau");
            entity.Property(e => e.Ngaytao)
                .HasColumnType("datetime")
                .HasColumnName("ngaytao");
            entity.Property(e => e.Taikhoan)
                .HasMaxLength(50)
                .HasColumnName("taikhoan");
            entity.Property(e => e.Trangthai).HasColumnName("trangthai");

            entity.HasMany(d => d.Maquyens).WithMany(p => p.Manvs)
                .UsingEntity<Dictionary<string, object>>(
                    "Phanquyen",
                    r => r.HasOne<Quyentruycap>().WithMany()
                        .HasForeignKey("Maquyen")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__phanquyen__maquy__3D5E1FD2"),
                    l => l.HasOne<Nhanvien>().WithMany()
                        .HasForeignKey("Manv")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__phanquyen__manv__3C69FB99"),
                    j =>
                    {
                        j.HasKey("Manv", "Maquyen").HasName("PK__phanquye__8081502BB05CDF5A");
                        j.ToTable("phanquyen");
                        j.IndexerProperty<int>("Manv").HasColumnName("manv");
                        j.IndexerProperty<int>("Maquyen").HasColumnName("maquyen");
                    });
        });

        modelBuilder.Entity<Phieunhaphang>(entity =>
        {
            entity.HasKey(e => e.Mapn).HasName("PK__phieunha__7A21C3A2795FCB42");

            entity.ToTable("phieunhaphang");

            entity.Property(e => e.Mapn)
                .ValueGeneratedNever()
                .HasColumnName("mapn");
            entity.Property(e => e.Ghichu)
                .HasMaxLength(255)
                .HasColumnName("ghichu");
            entity.Property(e => e.Mancc).HasColumnName("mancc");
            entity.Property(e => e.Manv).HasColumnName("manv");
            entity.Property(e => e.Ngaynhap)
                .HasColumnType("datetime")
                .HasColumnName("ngaynhap");
            entity.Property(e => e.Tongtien).HasColumnName("tongtien");

            entity.HasOne(d => d.ManccNavigation).WithMany(p => p.Phieunhaphangs)
                .HasForeignKey(d => d.Mancc)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__phieunhap__mancc__76969D2E");

            entity.HasOne(d => d.ManvNavigation).WithMany(p => p.Phieunhaphangs)
                .HasForeignKey(d => d.Manv)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__phieunhaph__manv__778AC167");
        });

        modelBuilder.Entity<Quyentruycap>(entity =>
        {
            entity.HasKey(e => e.Maquyen).HasName("PK__quyentru__AA0E356EBED8DCD7");

            entity.ToTable("quyentruycap");

            entity.Property(e => e.Maquyen)
                .ValueGeneratedNever()
                .HasColumnName("maquyen");
            entity.Property(e => e.Mota)
                .HasMaxLength(255)
                .HasColumnName("mota");
            entity.Property(e => e.Tenquyen)
                .HasMaxLength(100)
                .HasColumnName("tenquyen");
        });

        modelBuilder.Entity<SoDiaChi>(entity =>
        {
            entity.HasKey(e => e.Madc).HasName("PK__SoDiaChi__7A21E05ABC5E495A");

            entity.ToTable("SoDiaChi");

            entity.Property(e => e.Madc).HasColumnName("madc");
            entity.Property(e => e.HotenNhan)
                .HasMaxLength(100)
                .HasColumnName("hoten_nhan");
            entity.Property(e => e.Loaidc)
                .HasMaxLength(50)
                .HasColumnName("loaidc");
            entity.Property(e => e.Macdinh).HasColumnName("macdinh");
            entity.Property(e => e.Makh).HasColumnName("makh");
            entity.Property(e => e.Phuongxa)
                .HasMaxLength(100)
                .HasColumnName("phuongxa");
            entity.Property(e => e.Quanhuyen)
                .HasMaxLength(100)
                .HasColumnName("quanhuyen");
            entity.Property(e => e.SdtNhan)
                .HasMaxLength(20)
                .HasColumnName("sdt_nhan");
            entity.Property(e => e.SonhaDuong)
                .HasMaxLength(255)
                .HasColumnName("sonha_duong");
            entity.Property(e => e.Tinhthanh)
                .HasMaxLength(100)
                .HasColumnName("tinhthanh");

            entity.HasOne(d => d.MakhNavigation).WithMany(p => p.SoDiaChis)
                .HasForeignKey(d => d.Makh)
                .HasConstraintName("FK__SoDiaChi__makh__2A164134");
        });

        modelBuilder.Entity<Thanhtoan>(entity =>
        {
            entity.HasKey(e => e.Matt).HasName("PK__thanhtoa__7A217E1F801110F0");

            entity.ToTable("thanhtoan");

            entity.Property(e => e.Matt)
                .ValueGeneratedNever()
                .HasColumnName("matt");
            entity.Property(e => e.Madh).HasColumnName("madh");
            entity.Property(e => e.Manv).HasColumnName("manv");
            entity.Property(e => e.Ngaytt)
                .HasColumnType("datetime")
                .HasColumnName("ngaytt");
            entity.Property(e => e.Phuongthuc)
                .HasMaxLength(50)
                .HasColumnName("phuongthuc");
            entity.Property(e => e.Trangthai)
                .HasMaxLength(50)
                .HasColumnName("trangthai");

            entity.HasOne(d => d.MadhNavigation).WithMany(p => p.Thanhtoans)
                .HasForeignKey(d => d.Madh)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__thanhtoan__madh__693CA210");

            entity.HasOne(d => d.ManvNavigation).WithMany(p => p.Thanhtoans)
                .HasForeignKey(d => d.Manv)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__thanhtoan__manv__6A30C649");
        });

        modelBuilder.Entity<Thuoc>(entity =>
        {
            entity.HasKey(e => e.Mathuoc).HasName("PK__thuoc__B901453E64728BFC");

            entity.ToTable("thuoc");

            entity.Property(e => e.Mathuoc)
                .ValueGeneratedNever()
                .HasColumnName("mathuoc");
            entity.Property(e => e.Chongchidinh)
                .HasMaxLength(255)
                .HasColumnName("chongchidinh");
            entity.Property(e => e.Donvitinh)
                .HasMaxLength(50)
                .HasColumnName("donvitinh");
            entity.Property(e => e.Giaban).HasColumnName("giaban");
            entity.Property(e => e.Giacu).HasColumnName("giacu");
            entity.Property(e => e.Hinhanh)
                .HasMaxLength(500)
                .HasColumnName("hinhanh");
            entity.Property(e => e.Hoatchat)
                .HasMaxLength(100)
                .HasColumnName("hoatchat");
            entity.Property(e => e.Lieudung)
                .HasMaxLength(255)
                .HasColumnName("lieudung");
            entity.Property(e => e.Loaithuoc)
                .HasMaxLength(50)
                .HasColumnName("loaithuoc");
            entity.Property(e => e.Maloai).HasColumnName("maloai");
            entity.Property(e => e.Nhasx)
                .HasMaxLength(100)
                .HasColumnName("nhasx");
            entity.Property(e => e.Quycachdonggoi)
                .HasMaxLength(100)
                .HasColumnName("quycachdonggoi");
            entity.Property(e => e.Sodangky)
                .HasMaxLength(50)
                .HasColumnName("sodangky");
            entity.Property(e => e.Soluongton).HasColumnName("soluongton");
            entity.Property(e => e.Tenthuoc)
                .HasMaxLength(100)
                .HasColumnName("tenthuoc");

            entity.HasOne(d => d.MaloaiNavigation).WithMany(p => p.Thuocs)
                .HasForeignKey(d => d.Maloai)
                .HasConstraintName("FK__thuoc__maloai__46E78A0C");
        });

        modelBuilder.Entity<Tonkho>(entity =>
        {
            entity.HasKey(e => new { e.Malo, e.Makho }).HasName("PK__tonkho__8A8A1C9E188423CD");

            entity.ToTable("tonkho");

            entity.Property(e => e.Malo).HasColumnName("malo");
            entity.Property(e => e.Makho).HasColumnName("makho");
            entity.Property(e => e.Soluongton).HasColumnName("soluongton");

            entity.HasOne(d => d.MakhoNavigation).WithMany(p => p.Tonkhos)
                .HasForeignKey(d => d.Makho)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__tonkho__makho__5629CD9C");

            entity.HasOne(d => d.MaloNavigation).WithMany(p => p.Tonkhos)
                .HasForeignKey(d => d.Malo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__tonkho__malo__5535A963");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.Mavoucher).HasName("PK__voucher__73CB408A942428F9");

            entity.ToTable("voucher");

            entity.Property(e => e.Mavoucher)
                .ValueGeneratedNever()
                .HasColumnName("mavoucher");
            entity.Property(e => e.Dontoithieu).HasColumnName("dontoithieu");
            entity.Property(e => e.Giatri).HasColumnName("giatri");
            entity.Property(e => e.Loaigiamgia)
                .HasMaxLength(20)
                .HasColumnName("loaigiamgia");
            entity.Property(e => e.Ngaybd)
                .HasColumnType("datetime")
                .HasColumnName("ngaybd");
            entity.Property(e => e.Ngaykt)
                .HasColumnType("datetime")
                .HasColumnName("ngaykt");
            entity.Property(e => e.Tenvoucher)
                .HasMaxLength(100)
                .HasColumnName("tenvoucher");
            entity.Property(e => e.Trangthai)
                .HasMaxLength(50)
                .HasColumnName("trangthai");

            entity.HasMany(d => d.Madhs).WithMany(p => p.Mavouchers)
                .UsingEntity<Dictionary<string, object>>(
                    "Apdungvoucher",
                    r => r.HasOne<Donhang>().WithMany()
                        .HasForeignKey("Madh")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__apdungvouc__madh__72C60C4A"),
                    l => l.HasOne<Voucher>().WithMany()
                        .HasForeignKey("Mavoucher")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__apdungvou__mavou__71D1E811"),
                    j =>
                    {
                        j.HasKey("Mavoucher", "Madh").HasName("PK__apdungvo__14695E88FA4B25A0");
                        j.ToTable("apdungvoucher");
                        j.IndexerProperty<int>("Mavoucher").HasColumnName("mavoucher");
                        j.IndexerProperty<int>("Madh").HasColumnName("madh");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
