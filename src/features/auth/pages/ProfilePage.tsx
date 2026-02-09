import {
  Package,
  Heart,
  Settings,
  Star,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { useAuth } from "@/shared/contexts/auth-context";
import { routes } from "@/shared/lib/routes";
import styles from "./ProfilePage.module.css";

const orders = [
  {
    id: "1234",
    date: "20/10/2025",
    status: "Entregue",
    total: 156.8,
    items: 3,
    image: "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?w=100",
  },
  {
    id: "1233",
    date: "15/10/2025",
    status: "Em transito",
    total: 89.9,
    items: 1,
    image: "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?w=100",
  },
  {
    id: "1232",
    date: "05/10/2025",
    status: "Entregue",
    total: 234.5,
    items: 5,
    image: "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=100",
  },
];

const wishlist = [
  {
    id: "w1",
    name: "Serum Anti-Idade Vitamina C",
    price: 89.9,
    image: "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=200",
    inStock: true,
  },
  {
    id: "w2",
    name: "Paleta de Sombras Rose Gold",
    price: 79.9,
    image: "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?w=200",
    inStock: true,
  },
  {
    id: "w3",
    name: "Base Liquida HD",
    price: 69.9,
    image: "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?w=200",
    inStock: false,
  },
];

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.profileRow}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>
                <span>MJ</span>
              </div>
              <div>
                <h1 className={styles.name}>Ana Clara</h1>
                <p className={styles.email}>anaclara12@email.com</p>
                <div className={styles.badgeRow}>
                  <Badge className={styles.statusOther}>Cliente VIP</Badge>
                  <span className={styles.memberSince}>
                    Membro desde Out 2024
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              <LogOut className={styles.iconInline} />
              Sair
            </Button>
          </div>

          <div className={styles.loyaltyCard}>
            <div className={styles.loyaltyHeader}>
              <div>
                <h3 className={styles.loyaltyTitle}>Programa de Fidelidade</h3>
                <p className={styles.loyaltyText}>Voce tem 850 pontos</p>
              </div>
              <div className={styles.textRight}>
                <p className={styles.loyaltyHighlight}>Faltam 150 pontos</p>
                <p className={styles.loyaltyText}>para o proximo nivel</p>
              </div>
            </div>
            <Progress value={85} className={styles.progressBar} />
          </div>
        </div>

        <div className={styles.tabsCard}>
          <Tabs defaultValue="orders" className={styles.tabsRoot}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="orders" className={styles.tabTrigger}>
                <Package className={styles.iconInline} />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="wishlist" className={styles.tabTrigger}>
                <Heart className={styles.iconInline} />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="reviews" className={styles.tabTrigger}>
                <Star className={styles.iconInline} />
                Avaliacoes
              </TabsTrigger>
              <TabsTrigger value="settings" className={styles.tabTrigger}>
                <Settings className={styles.iconInline} />
                Configuracoes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Historico de Pedidos</h2>
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderInfo}>
                      <ImageWithFallback
                        src={order.image}
                        alt="Product"
                        className={styles.orderImage}
                      />
                      <div>
                        <p className={styles.orderId}>Pedido #{order.id}</p>
                        <p className={styles.orderMeta}>
                          {order.date} • {order.items}{" "}
                          {order.items === 1 ? "item" : "itens"}
                        </p>
                        <Badge
                          className={
                            order.status === "Entregue"
                              ? `${styles.statusBadge} ${styles.statusDelivered}`
                              : order.status === "Em transito"
                              ? `${styles.statusBadge} ${styles.statusTransit}`
                              : `${styles.statusBadge} ${styles.statusOther}`
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    <div className={styles.textRight}>
                      <p className={styles.orderTotal}>
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className={styles.orderButton}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wishlist" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Minha Wishlist</h2>
              <div className={styles.wishlistGrid}>
                {wishlist.map((item) => (
                  <div key={item.id} className={styles.wishlistCard}>
                    <div className={styles.wishlistImageWrap}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className={styles.wishlistImage}
                      />
                    </div>
                    <div className={styles.wishlistBody}>
                      <h3 className={styles.wishlistTitle}>{item.name}</h3>
                      <p className={styles.wishlistPrice}>
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </p>
                      <div className={styles.wishlistActions}>
                        <Button
                          variant="default"
                          size="sm"
                          className={styles.wishlistAddButton}
                          disabled={!item.inStock}
                        >
                          {item.inStock ? (
                            <>
                              <ShoppingBag className={styles.iconInline} />
                              Adicionar
                            </>
                          ) : (
                            "Indisponivel"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className={styles.wishlistIconButton}
                        >
                          <Heart className={styles.iconFavorite} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Minhas Avaliacoes</h2>
              <div className={styles.reviewList}>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div>
                      <p className={styles.reviewTitle}>
                        Batom Matte Nude Luxo
                      </p>
                      <div className={styles.reviewStars}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={styles.reviewStar} />
                        ))}
                      </div>
                    </div>
                    <span className={styles.reviewDate}>15/10/2025</span>
                  </div>
                  <p className={styles.reviewText}>
                    Produto maravilhoso! Amei a textura e a cor e perfeita.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Configuracoes da Conta</h2>
              <div className={styles.settingsSection}>
                <div>
                  <h3 className={styles.settingsGroupTitle}>
                    Informacoes Pessoais
                  </h3>
                  <div className={styles.settingsList}>
                    <div className={styles.settingsRow}>
                      <span className={styles.settingsLabel}>Nome</span>
                      <span className={styles.settingsValue}>Ana Clara</span>
                    </div>
                    <div className={styles.settingsRow}>
                      <span className={styles.settingsLabel}>E-mail</span>
                      <span className={styles.settingsValue}>
                        anaclara12@email.com
                      </span>
                    </div>
                    <div className={styles.settingsRow}>
                      <span className={styles.settingsLabel}>Telefone</span>
                      <span className={styles.settingsValue}>
                        (61) 99999-9999
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={styles.settingsGroupTitle}>
                    Enderecos Salvos
                  </h3>
                  <div className={styles.addressCard}>
                    <p className={styles.addressTitle}>Endereco Principal</p>
                    <p className={styles.addressText}>
                      SQN 303 Bloco D - Brasilia, DF - 01234-567
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className={styles.settingsGroupTitle}>Seguranca</h3>
                  <Button size="lg" variant="default" className={styles.passwordButton}>
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
