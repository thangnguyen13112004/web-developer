create database DB_QuanLyNhaThuoc1
go
use DB_QuanLyNhaThuoc1
go

create table nhanvien (
  manv int primary key,
  hoten nvarchar(100) not null,
  chucvu nvarchar(50), 
  taikhoan nvarchar(50) not null unique,
  matkhau nvarchar(100) not null,
  trangthai bit,
  ngaytao datetime
)

create table quyentruycap (
  maquyen int primary key,
  tenquyen nvarchar(100) not null,
  mota nvarchar(255)
)

create table phanquyen (
  manv int,
  maquyen int,
  primary key (manv, maquyen),
  foreign key (manv) references nhanvien(manv),
  foreign key (maquyen) references quyentruycap(maquyen)
)

create table nhacungcap (
  mancc int primary key,
  tenncc nvarchar(100) not null,
  sdt nvarchar(20),
  diachi nvarchar(255)
)

create table loaithuoc (
  maloai int primary key,
  tenloai nvarchar(100) not null
)

create table thuoc (
  mathuoc int primary key,
  tenthuoc nvarchar(100) not null,
  hoatchat nvarchar(100),
  sodangky nvarchar(50),
  quycachdonggoi nvarchar(100),
  donvitinh nvarchar(50),
  giaban float not null check (giaban >= 0),
  soluongton int not null default 0 check (soluongton >= 0),
  nhasx nvarchar(100),
  loaithuoc nvarchar(50),
  chongchidinh nvarchar(255),
  lieudung nvarchar(255),
  maloai int,
  foreign key (maloai) references loaithuoc(maloai)
)

create table kho (
  makho int primary key,
  tenkho nvarchar(100) not null,
  diachi nvarchar(255)
)

create table lothuoc (
  malo int primary key,
  mathuoc int not null,
  solo nvarchar(50) not null,
  ngaysanxuat datetime,
  hansudung datetime,
  soluongnhap int not null check (soluongnhap > 0),
  dongianhap float not null check (dongianhap >= 0),
  mancc int,
  manv int,
  ngaynhap datetime,
  foreign key (mathuoc) references thuoc(mathuoc),
  foreign key (mancc) references nhacungcap(mancc),
  foreign key (manv) references nhanvien(manv),
  constraint ck_lothuoc_hansudung check (hansudung > ngaysanxuat),
  constraint uq_lothuoc_solo unique (mathuoc, solo)
)

create table tonkho (
  malo int,
  makho int,
  soluongton int not null check (soluongton >= 0),
  primary key (malo, makho),
  foreign key (malo) references lothuoc(malo),
  foreign key (makho) references kho(makho)
)

create table khachhang (
  makh int primary key,
  hoten nvarchar(100) not null,
  sdt nvarchar(20) not null unique,
  email nvarchar(100),
  diachi nvarchar(255),
  matkhau nvarchar(100),
  ngaytao datetime
)

create table donthuoc (
  madonthuoc int primary key,
  makh int not null,
  tenbacsi nvarchar(100),
  benhvien nvarchar(100),
  chuandoan nvarchar(255),
  ngaykethuoc datetime,
  hinhanhdonthuoc nvarchar(255),
  foreign key (makh) references khachhang(makh)
)

create table donhang (
  madh int primary key,
  makh int not null,
  madonthuoc int,
  ngaydat datetime,
  trangthai nvarchar(50),
  tongtien float not null check (tongtien >= 0),
  foreign key (makh) references khachhang(makh),
  foreign key (madonthuoc) references donthuoc(madonthuoc)
)

create table chitietdonhang (
  madh int,
  malo int,
  soluong int not null check (soluong > 0),
  dongia float not null check (dongia >= 0),
  thanhtien float,
  primary key (madh, malo),
  foreign key (madh) references donhang(madh),
  foreign key (malo) references lothuoc(malo)
)

create table thanhtoan (
  matt int primary key,
  madh int not null,
  manv int not null, 
  phuongthuc nvarchar(50),
  trangthai nvarchar(50),
  ngaytt datetime,
  foreign key (madh) references donhang(madh),
  foreign key (manv) references nhanvien(manv)
)

create table voucher (
  mavoucher int primary key,
  tenvoucher nvarchar(100) not null,
  giatri float not null check (giatri >= 0),
  loaigiamgia nvarchar(20),
  dontoithieu float not null check (dontoithieu >= 0),
  ngaybd datetime,
  ngaykt datetime,
  trangthai nvarchar(50),
  constraint ck_voucher_ngay check (ngaykt is null or ngaybd is null or ngaykt >= ngaybd)
)

create table apdungvoucher (
  mavoucher int,
  madh int,
  primary key (mavoucher, madh),
  foreign key (mavoucher) references voucher(mavoucher),
  foreign key (madh) references donhang(madh)
)

create table phieunhaphang (
  mapn int primary key,
  mancc int not null,
  manv int not null,
  ngaynhap datetime,
  tongtien float not null check (tongtien >= 0),
  ghichu nvarchar(255),
  foreign key (mancc) references nhacungcap(mancc),
  foreign key (manv) references nhanvien(manv)
)

-- 🧾 Chi tiết phiếu nhập (bổ sung mới)
create table chitietphieunhap (
  mapn int,
  mathuoc int,
  solo nvarchar(50),
  ngaysanxuat datetime,
  hansudung datetime,
  soluong int check (soluong > 0),
  dongia float check (dongia >= 0),
  thanhtien as (soluong * dongia),
  primary key (mapn, mathuoc, solo),
  foreign key (mapn) references phieunhaphang(mapn),
  foreign key (mathuoc) references thuoc(mathuoc)
)

create table dondathang (
  maddh int primary key,
  mancc int not null,
  manv int not null, 
  ngaydat datetime,
  tongtien float check (tongtien >= 0),
  trangthai nvarchar(50),
  foreign key (mancc) references nhacungcap(mancc),
  foreign key (manv) references nhanvien(manv)
)

create table chitietdondathang (
  maddh int,
  mathuoc int,
  soluong int check (soluong > 0),
  dongia float check (dongia >= 0),
  thanhtien as (soluong * dongia),
  primary key (maddh, mathuoc),
  foreign key (maddh) references dondathang(maddh),
  foreign key (mathuoc) references thuoc(mathuoc)
)

create table chitietdonthuoc (
  madonthuoc int,
  mathuoc int,
  soluong int not null check (soluong > 0),
  lieudung nvarchar(255),
  dongia float check (dongia >= 0),
  thanhtien as (soluong * dongia),
  primary key (madonthuoc, mathuoc),
  foreign key (madonthuoc) references donthuoc(madonthuoc),
  foreign key (mathuoc) references thuoc(mathuoc)
)

create table baocao (
  mabc int primary key,
  loaibaocao nvarchar(50),
  ngaylap datetime,
  manv int,
  noidung nvarchar(255),
  foreign key (manv) references nhanvien(manv)
)


/*=======================================================================Thêm mới=============================================*/
USE DB_QuanLyNhaThuoc2
GO

-- 1. Thêm cột để lưu trữ URL hình ảnh
ALTER TABLE thuoc
ADD hinhanh nvarchar(500) NULL
GO

-- 2. Thêm cột giá cũ (cho phép NULL, vì không phải sản phẩm nào cũng giảm giá)
ALTER TABLE thuoc
ADD giacu float NULL
GO
